import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { SiteFrame } from "./AppLayout";
import { SystemErrorScreen } from "./SystemScreen";

interface GlobalErrorBoundaryProps {
  children: ReactNode;
}

interface GlobalErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class GlobalErrorBoundary extends Component<GlobalErrorBoundaryProps, GlobalErrorBoundaryState> {
  state: GlobalErrorBoundaryState = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(error: Error): GlobalErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || "Во время работы сайта произошла непредвиденная ошибка.",
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Global UI error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SiteFrame>
          <SystemErrorScreen
            title="Интерфейс временно недоступен"
            lead="Во время работы страницы произошла ошибка. Попробуйте перейти в другой раздел или обновить страницу."
          />
        </SiteFrame>
      );
    }

    return this.props.children;
  }
}
