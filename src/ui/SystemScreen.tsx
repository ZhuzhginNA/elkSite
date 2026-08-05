import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface SystemScreenProps {
  title: string;
  lead: string;
  actions?: ReactNode;
}

interface SystemErrorScreenProps {
  title?: string;
  lead?: string;
  actions?: ReactNode;
}

export function SystemScreen({ title, lead, actions }: SystemScreenProps) {
  return (
    <div className="content-shell">
      <section className="content-panel system-screen">
        <div className="section-head section-head--center system-screen__head">
          <h1 className="section-title">{title}</h1>
          <p className="section-lead section-lead--center">{lead}</p>
        </div>

        {actions ? <div className="system-screen__actions">{actions}</div> : null}
      </section>
    </div>
  );
}

export function SystemErrorScreen({
  title = "Что-то пошло не так",
  lead = "Страница не смогла загрузить данные. Попробуйте открыть другой раздел или вернуться на главную.",
  actions,
}: SystemErrorScreenProps) {
  return <SystemScreen title={title} lead={lead} actions={actions ?? <SystemScreenDefaultActions />} />;
}

export function SystemNotFoundScreen({
  title = "Страница не найдена",
  lead = "Похоже, такого адреса нет или ссылка устарела. Можно вернуться в основные разделы сайта.",
  actions,
}: SystemErrorScreenProps) {
  return <SystemScreen title={title} lead={lead} actions={actions ?? <SystemScreenDefaultActions />} />;
}

export function SystemScreenDefaultActions() {
  return (
    <>
      <Link to="/" className="link-button link-button--primary">
        На главную
      </Link>
      <Link to="/catalog" className="link-button link-button--secondary">
        Открыть каталог
      </Link>
      <Link to="/contacts" className="link-button link-button--secondary">
        Контакты
      </Link>
    </>
  );
}
