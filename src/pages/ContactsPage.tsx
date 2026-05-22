import { useContacts } from "../features/cms/hooks";
import { ContentState } from "../ui/ContentState";

export function ContactsPage() {
  const { data, isLoading, isError, error } = useContacts();

  return (
    <div className="content-shell">
      <section className="content-panel">
        <div className="section-head">
          <h1 className="section-title">Контакты</h1>
          <p className="section-lead">
            Карта, вид с улицы и контактные данные компании. Основной контактный блок также выводится в подвале сайта.
          </p>
        </div>

        <div className="contacts-grid">
          <article className="panel-card">
            <h2>Карта</h2>
            {data ? (
              <a href={data.mapFullImageUrl ?? data.mapImageUrl} target="_blank" rel="noreferrer">
                <img src={data.mapImageUrl} alt="Карта офиса" className="contact-image" />
              </a>
            ) : null}
          </article>
          <article className="panel-card">
            <h2>Вид с улицы</h2>
            {data ? (
              <a href={data.officeFullImageUrl ?? data.officeImageUrl} target="_blank" rel="noreferrer">
                <img src={data.officeImageUrl} alt="Офис компании" className="contact-image" />
              </a>
            ) : null}
          </article>
        </div>
      </section>
    </div>
  );
}
