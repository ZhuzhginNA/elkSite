import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCatalogCards, useCatalogCategories, useCatalogCategoryChildren } from "../features/catalog/hooks";
import type { CatalogCardSummary, CatalogCategory } from "../shared/types";
import { ContentState } from "../ui/ContentState";

function stripCategoryCode(label: string) {
  return label.replace(/^\s*\d{2}(?:\.\d{2})?\s*/, "").trim() || label;
}

function CatalogCategoryRow({
  category,
  onClick,
}: {
  category: CatalogCategory;
  onClick: () => void;
}) {
  return (
    <button type="button" className="catalog-row catalog-row--category" onClick={onClick}>
      <span className="catalog-row__body">
        <strong>{stripCategoryCode(category.label)}</strong>
      </span>
    </button>
  );
}

function CatalogCardRow({ card }: { card: CatalogCardSummary }) {
  return (
    <Link to={`/catalog/${card.id}`} className="catalog-row catalog-row--card">
      <span className="catalog-row__index catalog-row__index--card" aria-hidden="true">
        □
      </span>
      <span className="catalog-row__body">
        <strong>{card.title}</strong>
      </span>
    </Link>
  );
}

export function CatalogPage() {
  const categoriesQuery = useCatalogCategories();
  const [selectedLevel1Id, setSelectedLevel1Id] = useState<string | null>(null);
  const [selectedLevel2Id, setSelectedLevel2Id] = useState<string | null>(null);
  const categories = categoriesQuery.data ?? [];
  const selectedLevel1 = useMemo(
    () => categories.find((category) => category.id === selectedLevel1Id) ?? null,
    [categories, selectedLevel1Id],
  );
  const childrenQuery = useCatalogCategoryChildren(selectedLevel1Id);
  const level2Categories = childrenQuery.data ?? [];
  const selectedLevel2 = useMemo(
    () => level2Categories.find((category) => category.id === selectedLevel2Id) ?? null,
    [level2Categories, selectedLevel2Id],
  );
  const cardsQuery = useCatalogCards(selectedLevel2Id);

  useEffect(() => {
    if (selectedLevel1Id && !categories.some((category) => category.id === selectedLevel1Id)) {
      setSelectedLevel1Id(null);
      setSelectedLevel2Id(null);
    }
  }, [categories, selectedLevel1Id]);

  useEffect(() => {
    if (selectedLevel2Id && !level2Categories.some((category) => category.id === selectedLevel2Id)) {
      setSelectedLevel2Id(null);
    }
  }, [level2Categories, selectedLevel2Id]);

  function selectLevel1(category: CatalogCategory) {
    setSelectedLevel1Id(category.id);
    setSelectedLevel2Id(null);
  }

  const catalogTitle = selectedLevel2
    ? stripCategoryCode(selectedLevel2.label)
    : selectedLevel1
      ? stripCategoryCode(selectedLevel1.label)
      : "Каталог";

  return (
    <div className="content-shell">
      <section className="content-panel">
        <div className="section-head">
          <h1 className="section-title">{catalogTitle}</h1>
          <p className="section-lead">
            {selectedLevel2
              ? "Карточки выбранного раздела."
              : selectedLevel1
                ? "Выберите подраздел, чтобы открыть карточки оборудования и документации."
                : "Выберите категорию, чтобы перейти к подразделам каталога."}
          </p>
        </div>

        {categoriesQuery.isLoading ? <ContentState>Загружаем категории...</ContentState> : null}
        {categoriesQuery.isError ? (
          <ContentState error>Не удалось загрузить каталог: {categoriesQuery.error.message}</ContentState>
        ) : null}

        {!categoriesQuery.isLoading && !categoriesQuery.isError ? (
          categories.length ? (
            <div className="catalog-browser">
              <div className="catalog-browser__toolbar">
                <div className="catalog-breadcrumbs" aria-label="Путь каталога">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLevel1Id(null);
                      setSelectedLevel2Id(null);
                    }}
                  >
                    Каталог
                  </button>
                  {selectedLevel1 ? (
                    <button type="button" onClick={() => setSelectedLevel2Id(null)}>
                      {stripCategoryCode(selectedLevel1.label)}
                    </button>
                  ) : null}
                  {selectedLevel2 ? <span>{stripCategoryCode(selectedLevel2.label)}</span> : null}
                </div>

                {selectedLevel2 ? (
                  <button type="button" className="catalog-up-button" onClick={() => setSelectedLevel2Id(null)}>
                    Назад к подразделам
                  </button>
                ) : selectedLevel1 ? (
                  <button type="button" className="catalog-up-button" onClick={() => setSelectedLevel1Id(null)}>
                    Назад к категориям
                  </button>
                ) : null}
              </div>

              <div className="catalog-list" aria-label="Список каталога">
                {!selectedLevel1
                  ? categories.map((category) => (
                      <CatalogCategoryRow key={category.id} category={category} onClick={() => selectLevel1(category)} />
                    ))
                  : null}

                {selectedLevel1 && childrenQuery.isLoading ? <ContentState>Загружаем подразделы...</ContentState> : null}
                {selectedLevel1 && childrenQuery.isError ? (
                  <ContentState error>Не удалось загрузить подразделы: {childrenQuery.error.message}</ContentState>
                ) : null}

                {selectedLevel1 && !selectedLevel2 && !childrenQuery.isLoading && !childrenQuery.isError
                  ? level2Categories.map((category) => (
                      <CatalogCategoryRow key={category.id} category={category} onClick={() => setSelectedLevel2Id(category.id)} />
                    ))
                  : null}

                {selectedLevel2 && cardsQuery.isLoading ? <ContentState>Загружаем карточки...</ContentState> : null}
                {selectedLevel2 && cardsQuery.isError ? (
                  <ContentState error>Не удалось загрузить карточки: {cardsQuery.error.message}</ContentState>
                ) : null}

                {selectedLevel2 && !cardsQuery.isLoading && !cardsQuery.isError ? (
                  cardsQuery.data?.length ? (
                    cardsQuery.data.map((card) => <CatalogCardRow key={card.id} card={card} />)
                  ) : (
                    <ContentState>В этой категории нет карточек с публичными документами.</ContentState>
                  )
                ) : null}
              </div>
            </div>
          ) : (
            <ContentState>В каталоге пока нет доступных категорий.</ContentState>
          )
        ) : null}
      </section>
    </div>
  );
}
