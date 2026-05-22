import { Link } from "react-router-dom";
import { useContacts } from "../features/cms/hooks";

export function AppFooter() {
  const { data } = useContacts();

  return (
    <footer className="footer-panel footer-panel--global">
      <div className="footer-panel__grid">
        <div>
          <h3>Контактная информация</h3>
          {data?.phones.map((phone) => (
            <p key={`${phone.label}-${phone.value}`}>
              {phone.label}: {phone.value}
            </p>
          ))}
          <p>{data?.email}</p>
        </div>
        <div>
          <h3>Адрес</h3>
          <p>{data?.address}</p>
          <Link to="/admin" className="footer-admin-link">
            Локальная админка
          </Link>
        </div>
        <div className="footer-panel__brand">
          <img src="/legacy/img/elk-logo.png" alt="Логотип ЭЛК" />
        </div>
      </div>
    </footer>
  );
}
