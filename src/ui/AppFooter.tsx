import { Link } from "react-router-dom";
import { useContacts } from "../features/cms/hooks";
import { primaryNavigation } from "../shared/navigation";

export function AppFooter() {
  const { data } = useContacts();

  return (
    <footer className="footer-panel footer-panel--global">
      <div className="footer-panel__inner">
        <div className="footer-panel__grid">
          <div className="footer-panel__section">
            <h3>Контакты</h3>
            <div className="footer-contact-list">
              {data?.phones.map((phone) => (
                <a
                  key={`${phone.label}-${phone.value}`}
                  href={`tel:${phone.value.replace(/[^\d+]/g, "")}`}
                  className="footer-contact"
                >
                  <span>{phone.label}</span>
                  <strong>{phone.value}</strong>
                </a>
              ))}
            </div>
          </div>
          <div className="footer-panel__section">
            <h3>Почта и разделы</h3>
            <a href={`mailto:${data?.email ?? ""}`} className="footer-contact footer-contact--compact">
              <span>Email</span>
              <strong>{data?.email}</strong>
            </a>
            <div className="footer-nav">
              {primaryNavigation.map(({ to, label }) => (
                <Link key={to} to={to} className="footer-nav__link">
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="footer-panel__section footer-panel__section--brand">
            <h3>Адрес</h3>
            <p>{data?.address}</p>
            <div className="footer-panel__brand">
              <img src="/legacy/img/elk-logo.png" alt="Логотип ЭЛК" loading="lazy" decoding="async" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
