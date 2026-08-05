import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useBlogPosts } from "../features/cms/hooks";
import { ContentState } from "../ui/ContentState";
import { SystemErrorScreen, SystemNotFoundScreen } from "../ui/SystemScreen";

export function BlogPostPage() {
  const { slug } = useParams();
  const { data, isLoading, isError } = useBlogPosts();

  const post = useMemo(() => data?.find((item) => item.slug === slug) ?? null, [data, slug]);

  if (isLoading) {
    return <ContentState>Загружаем статью...</ContentState>;
  }

  if (isError) {
    return <SystemErrorScreen title="Не удалось открыть статью" />;
  }

  if (!post) {
    return <SystemNotFoundScreen title="Статья не найдена" lead="Похоже, материал был удален или ссылка на него устарела." />;
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
