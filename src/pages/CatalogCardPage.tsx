import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  useCatalogCard,
  useCatalogCardImages,
  useCatalogCards,
  useCatalogCategories,
  useCatalogCategoryChildren,
} from "../features/catalog/hooks";
import { catalogCardPath, catalogRootPath, relatedCatalogCardPath } from "../features/catalog/routes";
import { appConfig } from "../shared/config";
import type { CatalogDocument, CatalogRelation } from "../shared/types";
import { ContentState } from "../ui/ContentState";
import { SystemErrorScreen } from "../ui/SystemScreen";

function backendUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${appConfig.cmsApiBase.replace(/\/api$/, "")}${path}`;
}

function DocumentRow({ document }: { document: CatalogDocument }) {
  return (
    <a href={backendUrl(document.downloadUrl)} className="catalog-action-row">
      <strong>{document.title}</strong>
    </a>
  );
}

function ZamPartRow({
  relation,
  level1Value,
  level2Value,
}: {
  relation: CatalogRelation;
  level1Value?: string;
  level2Value?: string;
}) {
  if (relation.available) {
    return (
      <Link
        to={relatedCatalogCardPath(relation.id, relation.categoryId, level1Value, level2Value)}
        className="catalog-action-row"
      >
        <strong>{relation.title}</strong>
      </Link>
    );
  }

  return (
    <div
      className="catalog-action-row catalog-action-row--disabled"
      title={"Недоступно для просмотра на сайте"}
      aria-label={`${relation.title}. Недоступно для просмотра на сайте`}
    >
      <strong>{relation.title}</strong>
    </div>
  );
}

interface CatalogCardPageProps {
  legacyCardId?: string;
}

export function CatalogCardPage({ legacyCardId }: CatalogCardPageProps) {
  const params = useParams();
  const cardId = legacyCardId ?? params.cardId;
  const level1Value = legacyCardId ? undefined : params.level1Value;
  const level2Value = legacyCardId ? undefined : params.level2Value;
  const { data, isLoading, isError } = useCatalogCard(cardId);
  const imagesQuery = useCatalogCardImages(cardId);
  const categoriesQuery = useCatalogCategories();
  const selectedLevel1 = useMemo(
    () =>
      level1Value
        ? (categoriesQuery.data ?? []).find((category) => category.value === level1Value) ?? null
        : null,
    [categoriesQuery.data, level1Value],
  );
  const childrenQuery = useCatalogCategoryChildren(selectedLevel1?.id ?? null);
  const selectedLevel2 = useMemo(
    () =>
      level2Value
        ? (childrenQuery.data ?? []).find((category) => category.value === level2Value) ?? null
        : null,
    [childrenQuery.data, level2Value],
  );
  const cardsQuery = useCatalogCards(selectedLevel2?.id ?? null);
  const fallbackCode = useMemo(
    () => (cardsQuery.data ?? []).find((card) => card.id === cardId)?.code,
    [cardId, cardsQuery.data],
  );
  const orderCode = data?.code ?? fallbackCode;
  const imageItems = (imagesQuery.data ?? []).slice(0, 6);
  const imageGridClassName =
    imageItems.length <= 1
      ? "catalog-passport-images catalog-passport-images--single"
      : imageItems.length === 2
        ? "catalog-passport-images catalog-passport-images--pair"
        : "catalog-passport-images";

  if (isError || imagesQuery.isError) {
    return <SystemErrorScreen title="Не удалось открыть карточку каталога" />;
  }

  return (
    <div className="content-shell">
      <section className="content-panel">
        {isLoading ? <ContentState>{"\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043c \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0443..."}</ContentState> : null}

        {data ? (
          <div className="catalog-passport">
            <div className="catalog-passport-topbar">
              <Link to={catalogRootPath()} className="link-button link-button--secondary catalog-back-button">
                {"\u0412\u0435\u0440\u043d\u0443\u0442\u044c\u0441\u044f \u0432 \u043a\u0430\u0442\u0430\u043b\u043e\u0433"}
              </Link>
            </div>

            <header className="catalog-passport-hero">
              <div>
                <h1>{data.title}</h1>
              </div>
            </header>

            {orderCode ? (
              <section className="catalog-passport-section">
                <div className="catalog-order-code">
                  <span>{"\u041a\u043e\u0434 \u0434\u043b\u044f \u0437\u0430\u043a\u0430\u0437\u0430"}</span>
                  <strong>{orderCode}</strong>
                </div>
              </section>
            ) : null}

            {imagesQuery.isLoading ? <ContentState>{"\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043c \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u044f..."}</ContentState> : null}
            {!imagesQuery.isLoading && !imagesQuery.isError && imageItems.length > 0 ? (
              <section className="catalog-passport-section">
                <div className={imageGridClassName}>
                  {imageItems.map((image) => (
                    <a key={`${image.url}-${image.filename ?? ""}`} href={image.url} target="_blank" rel="noreferrer" className="catalog-passport-image">
                      <img src={image.url} alt={image.title} loading="lazy" />
                    </a>
                  ))}
                </div>
              </section>
            ) : null}

            {data.comment ? (
              <section className="catalog-comment-box">
                <h2>{"\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435"}</h2>
                <p>{data.comment}</p>
              </section>
            ) : null}

            {data.zamParts.length ? (
              <section className="catalog-passport-section">
                <div className="catalog-passport-section__head">
                  <h2>{"\u0417\u0430\u043c\u0435\u043d\u044f\u0435\u043c\u044b\u0435 \u0447\u0430\u0441\u0442\u0438"}</h2>
                </div>
                <div className="catalog-action-list">
                  {data.zamParts.map((relation) => (
                    <ZamPartRow
                      key={relation.id}
                      relation={relation}
                      level1Value={level1Value}
                      level2Value={level2Value}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            <section className="catalog-passport-section">
              <div className="catalog-passport-section__head">
                <h2>{"\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u044b \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0438"}</h2>
              </div>

              {data.documents.length ? (
                <div className="catalog-action-list">
                  {data.documents.map((document) => (
                    <DocumentRow key={document.id} document={document} />
                  ))}
                </div>
              ) : (
                <div className="catalog-empty-strip">{"\u041f\u0443\u0431\u043b\u0438\u0447\u043d\u044b\u0445 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u043e\u0432 \u043d\u0435\u0442"}</div>
              )}
            </section>
          </div>
        ) : null}
      </section>
    </div>
  );
}
