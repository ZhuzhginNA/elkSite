import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { SiteFrame } from "../ui/AppLayout";
import { SystemErrorScreen, SystemNotFoundScreen } from "../ui/SystemScreen";

export function RouteErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <SiteFrame>
        <SystemNotFoundScreen />
      </SiteFrame>
    );
  }

  return (
    <SiteFrame>
      <SystemErrorScreen lead="Страница открылась с ошибкой. Попробуйте обновить ее или перейти в другой раздел сайта." />
    </SiteFrame>
  );
}
