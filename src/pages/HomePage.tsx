import { useCmsPage } from "../features/cms/hooks";
import { ContentState } from "../ui/ContentState";

const featureItems = [
  "Более 25 лет успешной работы",
  "Коллектив квалифицированных сотрудников",
  "Гарантия 3 года",
  "Своевременное выполнение заказов",
];

export function HomePage() {
  const { data, isLoading, isError, error } = useCmsPage("home");

  if (isLoading) {
    return <ContentState>Загружаем главную страницу...</ContentState>;
  }

  if (isError) {
    return <ContentState error>Не удалось загрузить главную: {error.message}</ContentState>;
  }

  return (
    <div className="content-shell">
      <section className="content-panel content-panel--hero">
        <div className="section-head section-head--center">
          <h1 className="section-title">{data?.title ?? "ООО «ЭЛК»"}</h1>
          <p className="section-lead">
            {data?.lead ??
              "Современный корпоративный сайт с навигацией по разделам и отдельным источником контента."}
          </p>
        </div>

        <div className="feature-grid">
          {featureItems.map((item) => (
            <article key={item} className="feature-card">
              <div className="feature-card__icon" />
              <span>{item}</span>
            </article>
          ))}
        </div>

        <div className="home-copy">
          {(data?.body ?? []).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
