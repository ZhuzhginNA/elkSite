import { useCatalogItems } from "../features/catalog/hooks";
import { ContentState } from "../ui/ContentState";

export function CatalogPage() {
  const { data, isLoading, isError, error } = useCatalogItems();

  return (
    <div className="content-shell">
      <section className="content-panel">
        <div className="section-head section-head--center">
          <h1 className="section-title">Каталог</h1>
          <p className="section-lead">Раздел будет наполняться отдельно через интеграцию с внешней системой каталога.</p>
        </div>

        {isLoading ? <ContentState>Загружаем каталог...</ContentState> : null}
        {isError ? <ContentState error>Не удалось загрузить каталог: {error.message}</ContentState> : null}

        {!isLoading && !isError ? (
          <div className="list-table">
            {data?.map((item) => (
              <article key={item.id} className="list-row">
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                </div>
                <span className="list-row__meta">{item.price}</span>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
