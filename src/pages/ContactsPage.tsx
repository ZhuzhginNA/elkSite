import { useContacts } from "../features/cms/hooks";
import { ContentState } from "../ui/ContentState";

const DEFAULT_MAP_CENTER = "35.866032%2C56.852814";
const DEFAULT_MAP_POINT = "35.866110%2C56.852896";
const DEFAULT_MAP_ZOOM = "18";
const DEFAULT_MAP_EMBED_URL = `https://yandex.ru/map-widget/v1/?ll=${DEFAULT_MAP_CENTER}&pt=${DEFAULT_MAP_POINT}&z=${DEFAULT_MAP_ZOOM}`;
const DEFAULT_MAP_EXTERNAL_URL = `https://yandex.ru/maps/?ll=${DEFAULT_MAP_CENTER}&pt=${DEFAULT_MAP_POINT}&z=${DEFAULT_MAP_ZOOM}`;
const DEFAULT_ROUTE_URL = "https://yandex.ru/maps/?rtext=~56.852896%2C35.866110&rtt=auto";

export function ContactsPage() {
  const { data, isLoading, isError, error } = useContacts();
  const mapEmbedUrl = data?.mapEmbedUrl ?? DEFAULT_MAP_EMBED_URL;
  const mapExternalUrl = data?.mapExternalUrl ?? DEFAULT_MAP_EXTERNAL_URL;
  const routeUrl = data?.routeUrl ?? DEFAULT_ROUTE_URL;

  return (
    <div className="content-shell">
      <section className="content-panel">
        <div className="section-head">
          <h1 className="section-title">Контакты</h1>
          <p className="section-lead">
            Основные телефоны, почта и карта офиса.
          </p>
        </div>

        {isLoading ? <ContentState>Загружаем контакты...</ContentState> : null}
        {isError ? <ContentState error>Не удалось загрузить контакты: {error.message}</ContentState> : null}

        {data ? (
          <>
            <div className="contacts-summary">
              {data.phones.map((phone) => (
                <a
                  key={`${phone.label}-${phone.value}`}
                  href={`tel:${phone.value.replace(/[^\d+]/g, "")}`}
                  className="contact-summary-card"
                >
                  <span>{phone.label}</span>
                  <strong>{phone.value}</strong>
                </a>
              ))}
              <a href={`mailto:${data.email}`} className="contact-summary-card">
                <span>Email</span>
                <strong>{data.email}</strong>
              </a>
            </div>

            <article className="panel-card contact-map-panel">
              <div className="contact-map-panel__head">
                <div>
                  <h2>Как нас найти</h2>
                </div>
              </div>

              <div className="contact-map-layout">
                <div className="contact-map-shell">
                  <iframe
                    className="contact-map-frame"
                    src={mapEmbedUrl}
                    title="Карта офиса ООО «ЭЛК» на Яндекс Картах"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>

                <aside className="contact-map-aside">
                  <div className="contact-meta-card">
                    <span>Адрес</span>
                    <strong>{data.address}</strong>
                  </div>

                  <div className="contact-meta-card">
                    <span>Email</span>
                    <strong>{data.email}</strong>
                  </div>

                  <div className="contact-map-actions">
                    <a href={mapExternalUrl} target="_blank" rel="noreferrer" className="action-button">
                      Открыть в Яндекс Картах
                    </a>
                    <a href={routeUrl} target="_blank" rel="noreferrer" className="action-button action-button--ghost">
                      Построить маршрут
                    </a>
                  </div>

                  
                </aside>
              </div>
            </article>
          </>
        ) : null}
      </section>
    </div>
  );
}
