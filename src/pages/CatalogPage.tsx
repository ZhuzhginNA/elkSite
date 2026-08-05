import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCatalogCards, useCatalogCategories, useCatalogCategoryChildren } from "../features/catalog/hooks";
import {
  catalogCardPath,
  catalogLevel1Path,
  catalogLevel2Path,
  catalogRootPath,
} from "../features/catalog/routes";
import type { CatalogCardSummary, CatalogCategory } from "../shared/types";
import { ContentState } from "../ui/ContentState";
import { SystemErrorScreen } from "../ui/SystemScreen";

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

function CatalogCardRow({
  card,
  level1Value,
  level2Value,
}: {
  card: CatalogCardSummary;
  level1Value: string;
  level2Value: string;
}) {
  return (
    <Link to={catalogCardPath(card.id, level1Value, level2Value)} className="catalog-row catalog-row--card">
      <span className="catalog-row__body">
        <strong>{card.title}</strong>
      </span>
    </Link>
  );
}

export function CatalogPage() {
  const navigate = useNavigate();
  const { level1Value, level2Value } = useParams();
  const categoriesQuery = useCatalogCategories();
  const categories = categoriesQuery.data ?? [];
  const selectedLevel1 = useMemo(
    () => (level1Value ? categories.find((category) => category.value === level1Value) ?? null : null),
    [categories, level1Value],
  );
  const childrenQuery = useCatalogCategoryChildren(selectedLevel1?.id ?? null);
  const level2Categories = childrenQuery.data ?? [];
  const selectedLevel2 = useMemo(
    () => (level2Value ? level2Categories.find((category) => category.value === level2Value) ?? null : null),
    [level2Categories, level2Value],
  );
  const cardsQuery = useCatalogCards(selectedLevel2?.id ?? null);

  useEffect(() => {
    if (!level1Value || categoriesQuery.isLoading) {
      return;
    }

    if (!selectedLevel1) {
      navigate(catalogRootPath(), { replace: true });
    }
  }, [categoriesQuery.isLoading, level1Value, navigate, selectedLevel1]);

  useEffect(() => {
    if (!level1Value || !level2Value || childrenQuery.isLoading || !selectedLevel1) {
      return;
    }

    if (!selectedLevel2) {
      navigate(catalogLevel1Path(selectedLevel1.value), { replace: true });
    }
  }, [childrenQuery.isLoading, level1Value, level2Value, navigate, selectedLevel1, selectedLevel2]);

  function selectLevel1(category: CatalogCategory) {
    navigate(catalogLevel1Path(category.value));
  }

  function selectLevel2(category: CatalogCategory) {
    if (!selectedLevel1) {
      return;
    }

    navigate(catalogLevel2Path(selectedLevel1.value, category.value));
  }

  const catalogTitle = selectedLevel2
    ? stripCategoryCode(selectedLevel2.label)
    : selectedLevel1
      ? stripCategoryCode(selectedLevel1.label)
      : "\u041a\u0430\u0442\u0430\u043b\u043e\u0433";

  if (categoriesQuery.isError) {
    return <SystemErrorScreen title="Не удалось открыть каталог" />;
  }

  if (selectedLevel1 && childrenQuery.isError) {
    return <SystemErrorScreen title="Не удалось загрузить подразделы каталога" />;
  }

  if (selectedLevel2 && cardsQuery.isError) {
    return <SystemErrorScreen title="Не удалось загрузить карточки каталога" />;
  }

  return (
    <div className="content-shell">
      <section className="content-panel">
        <div className="section-head">
          <h1 className="section-title">{catalogTitle}</h1>
          <p className="section-lead">
            {selectedLevel2
              ? "\u041a\u0430\u0440\u0442\u043e\u0447\u043a\u0438 \u0432\u044b\u0431\u0440\u0430\u043d\u043d\u043e\u0433\u043e \u0440\u0430\u0437\u0434\u0435\u043b\u0430."
              : selectedLevel1
                ? "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043f\u043e\u0434\u0440\u0430\u0437\u0434\u0435\u043b, \u0447\u0442\u043e\u0431\u044b \u043e\u0442\u043a\u0440\u044b\u0442\u044c \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0438 \u043e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u044f \u0438 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430\u0446\u0438\u0438."
                : "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044e, \u0447\u0442\u043e\u0431\u044b \u043f\u0435\u0440\u0435\u0439\u0442\u0438 \u043a \u043f\u043e\u0434\u0440\u0430\u0437\u0434\u0435\u043b\u0430\u043c \u043a\u0430\u0442\u0430\u043b\u043e\u0433\u0430."}
          </p>
        </div>

        {categoriesQuery.isLoading ? <ContentState>{"\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043c \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438..."}</ContentState> : null}
        {!categoriesQuery.isLoading ? (
          categories.length ? (
            <div className="catalog-browser">
              <div className="catalog-list" aria-label="\u0421\u043f\u0438\u0441\u043e\u043a \u043a\u0430\u0442\u0430\u043b\u043e\u0433\u0430">
                {!selectedLevel1
                  ? categories.map((category) => (
                      <CatalogCategoryRow key={category.id} category={category} onClick={() => selectLevel1(category)} />
                    ))
                  : null}

                {selectedLevel1 && childrenQuery.isLoading ? <ContentState>{"\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043c \u043f\u043e\u0434\u0440\u0430\u0437\u0434\u0435\u043b\u044b..."}</ContentState> : null}
                {selectedLevel1 && !selectedLevel2 && !childrenQuery.isLoading
                  ? level2Categories.map((category) => (
                      <CatalogCategoryRow key={category.id} category={category} onClick={() => selectLevel2(category)} />
                    ))
                  : null}

                {selectedLevel2 && cardsQuery.isLoading ? <ContentState>{"\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043c \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0438..."}</ContentState> : null}

                {selectedLevel2 && !cardsQuery.isLoading ? (
                  cardsQuery.data?.length ? (
                    cardsQuery.data.map((card) => (
                      <CatalogCardRow
                        key={card.id}
                        card={card}
                        level1Value={selectedLevel1.value}
                        level2Value={selectedLevel2.value}
                      />
                    ))
                  ) : (
                    <ContentState>{"\u0412 \u044d\u0442\u043e\u0439 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438 \u043d\u0435\u0442 \u043a\u0430\u0440\u0442\u043e\u0447\u0435\u043a \u0441 \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u044b\u043c\u0438 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430\u043c\u0438."}</ContentState>
                  )
                ) : null}
              </div>
            </div>
          ) : (
            <ContentState>{"\u0412 \u043a\u0430\u0442\u0430\u043b\u043e\u0433\u0435 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0445 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0439."}</ContentState>
          )
        ) : null}
      </section>
    </div>
  );
}
