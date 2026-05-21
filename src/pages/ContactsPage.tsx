import { useContacts } from "../features/cms/hooks";
import { ContentState } from "../ui/ContentState";

export function ContactsPage() {
  const { data, isLoading, isError, error } = useContacts();

  return (
    <div className="content-shell">
      <section className="content-panel">
        <div className="contacts-grid">
          <article className="panel-card">
            <h2>Карта</h2>
            {data ? <img src={data.mapImageUrl} alt="Карта офиса" className="contact-image" /> : null}
          </article>
          <article className="panel-card">
            <h2>Вид с улицы</h2>
            {data ? <img src={data.officeImageUrl} alt="Офис компании" className="contact-image" /> : null}
          </article>
        </div>
      </section>

      <footer className="footer-panel">
        {isLoading ? <ContentState>Загружаем контакты...</ContentState> : null}
        {isError ? <ContentState error>Не удалось загрузить контакты: {error.message}</ContentState> : null}

        {!isLoading && !isError && data ? (
          <div className="footer-panel__grid">
            <div>
              <h3>Контактная информация</h3>
              {data.phones.map((phone) => (
                <p key={phone}>{phone}</p>
              ))}
              <p>{data.email}</p>
            </div>
            <div>
              <h3>Адрес</h3>
              <p>{data.address}</p>
            </div>
            <div className="footer-panel__brand">ЭЛК</div>
          </div>
        ) : null}
      </footer>
    </div>
  );
}
