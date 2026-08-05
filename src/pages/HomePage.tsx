import { Link } from "react-router-dom";
import { useCmsContent } from "../features/cms/hooks";
import { ContentState } from "../ui/ContentState";
import { SystemErrorScreen } from "../ui/SystemScreen";

export function HomePage() {
  const { data, isLoading, isError } = useCmsContent();

  if (isLoading) {
    return <ContentState>Загружаем главную страницу...</ContentState>;
  }

  if (isError) {
    return <SystemErrorScreen title="Не удалось открыть главную страницу" />;
  }

  const homePage = data.pages.home;

  return (
    <div className="content-shell">
      <section className="content-panel content-panel--hero">
        <div className="home-hero">
          <div className="home-hero__copy">
            <div className="section-head">
              <h1 className="section-title">{homePage.title}</h1>
              <p className="section-lead">{homePage.lead}</p>
            </div>
            <div className="hero-actions">
              <Link className="link-button link-button--primary" to="/documents">
                Документы и сертификаты
              </Link>
              <Link className="link-button link-button--secondary" to="/contacts">
                Связаться с компанией
              </Link>
            </div>
          </div>
          <div className="home-hero__media">
            <div className="hero-slider">
              <img src="/legacy/img/slideshow/slide1.jpg" alt="Производство ООО ЭЛК" />
            </div>
          </div>
        </div>

        <section className="home-overview">
          <div className="home-overview__intro">
            <h2>Производственный подход, подтвержденный опытом и контролем качества</h2>
          </div>
          <div className="feature-grid">
            {data.homeFeatures.map((item, index) => (
              <article
                key={item}
                className="feature-card"
                style={{ "--stagger-index": index } as React.CSSProperties}
              >
                <div className="feature-card__icon" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <span>{item}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="home-sections">
          <div className="home-sections__head">
            <h2>Ключевые разделы, которые помогают быстро оценить возможности компании</h2>
          </div>
          <div className="home-card-grid">
            {data.homeCards.map((card, index) => (
              <Link
                key={card.slug}
                className="home-card"
                to={`/${card.slug}`}
                style={{ "--stagger-index": index + 1 } as React.CSSProperties}
              >
                <img src={card.imageUrl} alt={card.title} loading="lazy" decoding="async" />
                <div className="home-card__content">
                  <h2>{card.title}</h2>
                  <p>{card.description}</p>
                  <span className="home-card__cta">Подробнее</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="page-copy home-closing">
          {homePage.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
