import { Link } from "react-router-dom";
import { useCmsContent } from "../features/cms/hooks";
import { ContentState } from "../ui/ContentState";

export function HomePage() {
  const { data, isLoading, isError, error } = useCmsContent();

  if (isLoading) {
    return <ContentState>Загружаем главную страницу...</ContentState>;
  }

  if (isError) {
    return <ContentState error>Не удалось загрузить главную: {error.message}</ContentState>;
  }

  const homePage = data.pages.home;

  return (
    <div className="content-shell">
      <section className="content-panel content-panel--hero">
        <div className="hero-slider">
          <img src="/legacy/img/slideshow/slide1.jpg" alt="Производство ООО ЭЛК" />
        </div>

        <div className="section-head section-head--center">
          <h1 className="section-title">{homePage.title}</h1>
          <p className="section-lead">
            {homePage.lead}
          </p>
        </div>

        <div className="feature-grid">
          {data.homeFeatures.map((item) => (
            <article key={item} className="feature-card">
              <div className="feature-card__icon" />
              <span>{item}</span>
            </article>
          ))}
        </div>

        <div className="home-card-grid">
          {data.homeCards.map((card) => (
            <Link key={card.slug} className="home-card" to={`/${card.slug}`}>
              <img src={card.imageUrl} alt={card.title} />
              <div className="home-card__content">
                <h2>{card.title}</h2>
                <p>{card.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="page-copy page-copy--center">
          {homePage.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
