import React from "react";

/**
 * Root error boundary so a transient render error (e.g. reading a field off a
 * briefly-null user during logout/navigation) can never leave a permanent
 * blank page. Recovers by sending the user back to the home page.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, detail: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, detail: error?.message || "" };
  }

  componentDidCatch(error, info) {
    console.error("[app] render error:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, detail: "" });
    window.location.assign("/");
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
          <div className="max-w-md text-center">
            <h1 className="text-xl font-bold text-slate-900 mb-2">This page didn't load</h1>
            <p className="text-sm text-slate-500 mb-2">
              The page hit an error while rendering and stopped. Your data hasn't been
              changed — going back to the home page should clear it.
            </p>
            {this.state.detail ? (
              <p className="text-xs text-slate-400 mb-6 break-words">
                Technical detail: {this.state.detail}
              </p>
            ) : (
              <div className="mb-6" />
            )}
            <button
              onClick={this.handleReset}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
            >
              Go to home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
