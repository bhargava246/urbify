"use client";

import {
  Component,
  type ErrorInfo,
  type PropsWithChildren,
  type ReactNode,
} from "react";

type Props = PropsWithChildren<{
  /** Custom fallback UI. If omitted, renders a generic reload prompt. */
  fallback?: ReactNode;
  /** Optional callback invoked when an error is caught. Use for Sentry/logging. */
  onError?: (error: Error, info: ErrorInfo) => void;
}>;

type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Forward to external error tracker if provided
    this.props.onError?.(error, info);
    // Always log to console so it's visible in dev
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  private reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    // Default minimal fallback
    return (
      <div
        role="alert"
        style={{
          padding: "32px 24px",
          maxWidth: 480,
          margin: "64px auto",
          textAlign: "center",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <p style={{ fontWeight: 600, color: "#111827", marginBottom: 8 }}>
          An unexpected error occurred
        </p>
        {process.env.NODE_ENV !== "production" && this.state.error && (
          <pre
            style={{
              background: "#fef2f2",
              color: "#dc2626",
              borderRadius: 6,
              padding: "12px 16px",
              fontSize: 12,
              textAlign: "left",
              overflowX: "auto",
              marginBottom: 16,
            }}
          >
            {this.state.error.message}
          </pre>
        )}
        <button
          onClick={this.reset}
          style={{
            padding: "8px 20px",
            borderRadius: 8,
            background: "#0D7C66",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Try again
        </button>
      </div>
    );
  }
}
