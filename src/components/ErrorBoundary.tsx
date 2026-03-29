import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px", color: "white", background: "#0a0a0a", minHeight: "100vh", fontFamily: "sans-serif" }}>
          <h1 style={{ color: "#ff4d4f" }}>Something went wrong.</h1>
          <p>The application encountered an unexpected error.</p>
          <pre style={{ background: "#222", padding: "20px", borderRadius: "8px", overflowX: "auto", color: "#f8f8f2" }}>
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
