import { useAppContext } from "../../AppContext";

/**
 * Shared access to the authenticated organization for dashboard components.
 * Exposes everything on the app context plus the derived `user` object and
 * `isPro` flag so org section components don't each re-derive them.
 */
export function useOrgUser() {
  const ctx = useAppContext();
  const user = ctx.currentUser?.data || {};
  const isPro = user.subscription_tier === 'pro';
  return { ...ctx, user, isPro };
}
