import { NavLink, Outlet } from "react-router-dom";
import { AppFooter } from "./AppFooter";

const navigation = [
  { to: "/", label: "Главная", end: true },
  { to: "/catalog", label: "Каталог" },
  { to: "/gallery", label: "Галерея" },
  { to: "/documents", label: "Документы" },
  { to: "/blog", label: "Блог" },
  { to: "/contacts", label: "Контакты" },
];

export function AppLayout() {
  return (
    <div className="site-shell">
      <div className="site-background" />

      <header className="topbar">
        <div className="topbar__line" />
        <div className="topbar__inner">
          <div className="brand-wrap">
            <img className="brand-logo" src="/legacy/img/logo.png" alt="ООО ЭЛК" />
            <div className="brand-subtitle">Промышленная электроника на транспорте</div>
          </div>

          <nav className="nav" aria-label="Основная навигация">
            {navigation.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `nav__link${isActive ? " nav__link--active" : ""}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="page">
        <Outlet />
      </main>

      <div className="page">
        <AppFooter />
      </div>
    </div>
  );
}
