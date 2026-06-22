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
  about: "/about",
  pricing: "/pricing",
  singerDashboard: "/singer/dashboard",
  singerSettings: "/singer/settings",
  profileView: "/singer/profile",
  orgDashboard: "/organization/dashboard",
  orgSettings: "/organization/settings",
  emergencySearch: "/organization/emergency-search",
  adminLogin: "/admin/login",
  adminDashboard: "/admin/dashboard",
};

const VIEW_BY_PATH = Object.fromEntries(
  Object.entries(APP_ROUTES).map(([view, path]) => [path, view]),
);

/**
 * Access control per view. Views not listed here are public.
 *  - "singer":       requires a logged-in singer
 *  - "organization": requires a logged-in organization
 *  - "user":         requires any logged-in user (singer or organization)
 *  - "admin":        requires an authenticated admin session
 */
export const ROUTE_ACCESS = {
  singerDashboard: "singer",
  singerSettings: "singer",
  orgDashboard: "organization",
  orgSettings: "organization",
  emergencySearch: "organization",
  profileView: "user",
  adminDashboard: "admin",
};

/** Paths that don't require authentication (excludes the landing "/"). */
export const PUBLIC_PATHS = Object.entries(APP_ROUTES)
  .filter(([view, path]) => path !== "/" && !ROUTE_ACCESS[view])
  .map(([, path]) => path);

export function viewFromPath(pathname) {
  return VIEW_BY_PATH[pathname] ?? null;
}

export function pathFromView(view) {
  return APP_ROUTES[view] ?? "/";
}

export function requiredAccessForView(view) {
  return ROUTE_ACCESS[view] ?? null;
}

/**
 * Navigate to a view by name. `navigate` is the route-aware function provided
 * via app context (it changes the URL and re-renders the matching view).
 */
export function navigateToView(navigate, view, opts = {}) {
  navigate(view, opts);
}

/** For use in onClick handlers on <a href="..."> links. */
export function navClick(navigate, view) {
  return (e) => {
    if (e) e.preventDefault();
    navigate(view);
  };
}
