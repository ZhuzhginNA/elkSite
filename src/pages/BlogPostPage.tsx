import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useBlogPosts } from "../features/cms/hooks";
import { ContentState } from "../ui/ContentState";

export function BlogPostPage() {
  const { slug } = useParams();
  const { data, isLoading, isError, error } = useBlogPosts();

  const post = useMemo(() => data?.find((item) => item.slug === slug) ?? null, [data, slug]);

  if (isLoading) {
    return <ContentState>Загружаем статью...</ContentState>;
  }

  if (isError) {
    return <ContentState error>Не удалось загрузить статью: {error.message}</ContentState>;
  }

  if (!post) {
    return <ContentState>Статья не найдена.</ContentState>;
  }

  return (
    <div className="content-shell">
      <section className="content-panel">
        <div className="section-head">
          <h1 className="section-title">{post.title}</h1>
          <p className="section-lead">{post.publishedAt}</p>
        </div>

        <div className="page-hero-image">
          <img src={post.imageUrl} alt={post.title} />
        </div>

        <div className="tag-list tag-list--spaced">
          {post.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>

        <div className="page-copy">
          {post.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
