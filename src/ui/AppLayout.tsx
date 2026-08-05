import type { ReactNode } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { primaryNavigation } from "../shared/navigation";
import { AppFooter } from "./AppFooter";

interface SiteFrameProps {
  children: ReactNode;
}

export function SiteFrame({ children }: SiteFrameProps) {
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
        {children}
      </main>

      <AppFooter />
    </div>
  );
}

export function AppLayout() {
  return (
    <SiteFrame>
      <Outlet />
    </SiteFrame>
  );
}
