import { Link } from "react-router-dom";
import { useBlogPosts } from "../features/cms/hooks";
import { ContentState } from "../ui/ContentState";

export function BlogPage() {
  const { data, isLoading, isError, error } = useBlogPosts();

  return (
    <div className="content-shell">
      <section className="content-panel">
        <div className="section-head">
          <h1 className="section-title">Блог</h1>
          <p className="section-lead">Материалы о новых разработках, тестовом оборудовании и прикладных решениях компании.</p>
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
                  <div className="tag-list">
                    {post.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link to={`/blog/${post.slug}`} className="action-button">
                    Подробнее
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
