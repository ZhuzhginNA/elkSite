import { useEffect } from "react";
import { useCmsPage } from "../features/cms/hooks";
import { ContentState } from "../ui/ContentState";

interface ContentPageProps {
  slug: string;
}

export function ContentPage({ slug }: ContentPageProps) {
  const { data, isLoading, isError, error } = useCmsPage(slug);

  useEffect(() => {
    if (!data?.seo) {
      return;
    }

    document.title = data.seo.title;

    const descriptionElement = document.querySelector('meta[name="description"]');
    if (descriptionElement) {
      descriptionElement.setAttribute("content", data.seo.description);
    }
  }, [data]);

  if (isLoading) {
    return <ContentState>Загружаем страницу...</ContentState>;
  }

  if (isError) {
    return <ContentState error>Не удалось загрузить страницу: {error.message}</ContentState>;
  }

  if (!data) {
    return <ContentState>Страница не найдена.</ContentState>;
  }

  return (
    <div className="content-shell">
      <section className="content-panel">
        <div className="section-head">
          <h1 className="section-title">{data.title}</h1>
          <p className="section-lead">{data.lead}</p>
        </div>

        {data.imageUrl ? (
          <div className="page-hero-image">
            <img src={data.imageUrl} alt={data.title} />
          </div>
        ) : null}

        <div className="page-copy">
          {data.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {data.bullets?.length ? (
          <div className="bullet-list">
            {data.bullets.map((item) => (
              <div key={item} className="bullet-item">
                {item}
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
