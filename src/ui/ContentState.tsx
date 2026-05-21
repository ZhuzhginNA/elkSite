import type { ReactNode } from "react";

interface ContentStateProps {
  children: ReactNode;
  error?: boolean;
}

export function ContentState({ children, error = false }: ContentStateProps) {
  return <div className={`state${error ? " state--error" : ""}`}>{children}</div>;
}
