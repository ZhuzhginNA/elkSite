import { SystemNotFoundScreen, SystemScreenDefaultActions } from "../ui/SystemScreen";

export function NotFoundPage() {
  return (
    <SystemNotFoundScreen actions={<SystemScreenDefaultActions />} />
  );
}
