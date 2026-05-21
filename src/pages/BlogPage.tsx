import { useBlogPosts } from "../features/cms/hooks";
import { ContentState } from "../ui/ContentState";

export function BlogPage() {
  const { data, isLoading, isError, error } = useBlogPosts();

  return (
    <div className="content-shell">
      <section className="content-panel">
        <div className="section-head">
          <h1 className="section-title">Блог</h1>
          <p className="section-lead">Новости и статьи почти всегда удобнее вести через CMS, а не через ручные правки в репозитории.</p>
        </div>

        {isLoading ? <ContentState>Загружаем блог...</ContentState> : null}
        {isError ? <ContentState error>Не удалось загрузить блог: {error.message}</ContentState> : null}

        {!isLoading && !isError ? (
          <div className="blog-list">
            {data?.map((post) => (
              <article key={post.id} className="blog-card">
                <img src={post.imageUrl} alt={post.title} />
                <div className="blog-card__content">
                  <h3>{post.title}</h3>
                  <p className="blog-card__meta">{post.publishedAt}</p>
                  <p>{post.excerpt}</p>
                  <button type="button" className="action-button">
                    Подробнее
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
