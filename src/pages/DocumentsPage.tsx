import { useDocuments } from "../features/cms/hooks";
import { ContentState } from "../ui/ContentState";

export function DocumentsPage() {
  const { data, isLoading, isError, error } = useDocuments();

  return (
    <div className="content-shell">
      <section className="content-panel">
        <div className="section-head">
          <h1 className="section-title">Документы</h1>
          <p className="section-lead">Сертификаты, реквизиты и прочие документы компании, перенесенные со старого сайта.</p>
        </div>

        {isLoading ? <ContentState>Загружаем документы...</ContentState> : null}
        {isError ? <ContentState error>Не удалось загрузить документы: {error.message}</ContentState> : null}

        {!isLoading && !isError ? (
          <div className="stack-list">
            {data?.map((item) => (
              <article key={item.id} className="document-card">
                <div className="document-card__layout">
                  {item.previewUrl ? (
                    <a href={item.fileUrl} target="_blank" rel="noreferrer" className="document-card__preview">
                      <img src={item.previewUrl} alt={item.title} />
                    </a>
                  ) : null}
                  <div>
                    <span className="document-card__tag">{item.category}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <a href={item.fileUrl} target="_blank" rel="noreferrer">
                      Открыть документ
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
