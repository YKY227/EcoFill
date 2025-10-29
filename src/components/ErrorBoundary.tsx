// src/components/ErrorBoundary.tsx
import React from "react";

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { err?: Error }> {
  state = { err: undefined as Error | undefined };
  static getDerivedStateFromError(err: Error) { return { err }; }
  render() {
    if (this.state.err) {
      return (
        <div style={{ padding: 16 }}>
          <h3>Something went wrong.</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>{this.state.err.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
