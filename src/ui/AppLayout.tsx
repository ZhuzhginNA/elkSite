import { NavLink, Outlet } from "react-router-dom";
import { primaryNavigation } from "../shared/navigation";
import { AppFooter } from "./AppFooter";

export function AppLayout() {
  return (
    <div className="site-shell">
      <div className="site-background" />

      <header className="topbar">
        <div className="topbar__inner">
          <div className="brand-wrap">
            <img className="brand-logo" src="/legacy/img/logo.png" alt="ООО ЭЛК" />
          </div>

          <nav className="nav" aria-label="Основная навигация">
            {primaryNavigation.map(({ to, label, end }) => (
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

      <AppFooter />
    </div>
  );
}
