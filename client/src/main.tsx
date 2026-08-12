import { createRoot } from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./ErrorBoundary";
import { installAuthFetch } from "./lib/authFetch";
import "./index.css";

// Must run before any component mounts so the first request already carries the token.
installAuthFetch();

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
