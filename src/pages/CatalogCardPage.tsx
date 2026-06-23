import { Link, useParams } from "react-router-dom";
import { useCatalogCard, useCatalogCardImages } from "../features/catalog/hooks";
import { appConfig } from "../shared/config";
import type { CatalogDocument, CatalogRelation } from "../shared/types";
import { ContentState } from "../ui/ContentState";

function countLabel(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return `${count} позиция`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} позиции`;
  return `${count} позиций`;
}

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

function ZamPartRow({ relation }: { relation: CatalogRelation }) {
  if (relation.available) {
    return (
      <Link to={`/catalog/${relation.id}`} className="catalog-action-row">
        <strong>{relation.title}</strong>
      </Link>
    );
  }

  return (
    <div className="catalog-action-row catalog-action-row--disabled">
      <strong>{relation.title}</strong>
    </div>
  );
}

export function CatalogCardPage() {
  const { cardId } = useParams();
  const { data, isLoading, isError, error } = useCatalogCard(cardId);
  const imagesQuery = useCatalogCardImages(cardId);

  return (
    <div className="content-shell">
      <section className="content-panel">
        <Link to="/catalog" className="catalog-back-link">
          Вернуться в каталог
        </Link>

        {isLoading ? <ContentState>Загружаем карточку...</ContentState> : null}
        {isError ? <ContentState error>Не удалось загрузить карточку: {error.message}</ContentState> : null}

        {data ? (
          <div className="catalog-passport">
            <header className="catalog-passport-hero">
              <div>
                <h1>{data.title}</h1>
              </div>
            </header>

            {imagesQuery.isLoading ? <ContentState>Загружаем изображения...</ContentState> : null}
            {!imagesQuery.isLoading && !imagesQuery.isError && (imagesQuery.data?.length ?? 0) > 0 ? (
              <section className="catalog-passport-section">
                
                <div className="catalog-passport-images">
                  {(imagesQuery.data ?? []).slice(0, 6).map((image) => (
                    <a key={`${image.url}-${image.filename ?? ""}`} href={image.url} target="_blank" rel="noreferrer" className="catalog-passport-image">
                      <img src={image.url} alt={image.title} loading="lazy" />
                      
                    </a>
                  ))}
                </div>
              </section>
            ) : null}

            {data.comment ? (
              <section className="catalog-comment-box">
                <h2>Описание</h2>
                <p>{data.comment}</p>
              </section>
            ) : null}

            {data.zamParts.length ? (
              <section className="catalog-passport-section">
                <div className="catalog-passport-section__head">
                  <h2>Заменяемые части</h2>
                  
                </div>
                <div className="catalog-action-list">
                  {data.zamParts.map((relation) => (
                    <ZamPartRow key={relation.id} relation={relation} />
                  ))}
                </div>
              </section>
            ) : null}

            <section className="catalog-passport-section">
              <div className="catalog-passport-section__head">
                <h2>Документы карточки</h2>
                
              </div>

              {data.documents.length ? (
                <div className="catalog-action-list">
                  {data.documents.map((document) => (
                    <DocumentRow key={document.id} document={document} />
                  ))}
                </div>
              ) : (
                <div className="catalog-empty-strip">Публичных документов нет</div>
              )}
            </section>
          </div>
        ) : null}
      </section>
    </div>
  );
}
