/** Maps in-app view names to browser paths (SPA routing). */
export const APP_ROUTES = {
  landing: "/",
  singerLogin: "/login/singer",
  organizationLogin: "/login/organization",
  singerRegister: "/register/singer",
  orgRegister: "/register/organization",
  terms: "/terms",
  privacy: "/privacy",
  resetPassword: "/reset-password",
};

const VIEW_BY_PATH = Object.fromEntries(
  Object.entries(APP_ROUTES).map(([view, path]) => [path, view]),
);

export const PUBLIC_PATHS = Object.values(APP_ROUTES).filter((p) => p !== "/");

export function viewFromPath(pathname) {
  return VIEW_BY_PATH[pathname] ?? null;
}

export function navigateToView(setView, view, { replace = false } = {}) {
  const path = APP_ROUTES[view];
  if (path !== undefined) {
    if (replace) window.history.replaceState({}, "", path);
    else window.history.pushState({}, "", path);
  }
  setView(view);
}

/** For use in onClick handlers on <a href="..."> links */
export function navClick(setView, view) {
  return (e) => {
    e.preventDefault();
    navigateToView(setView, view);
  };
}
