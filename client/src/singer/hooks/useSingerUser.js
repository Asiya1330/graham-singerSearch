import { useAppContext } from "../../AppContext";

/**
 * Shared access to the authenticated singer for dashboard section components.
 * Returns the singer `user` object plus helpers used across sections:
 * - `refreshUser()` re-fetches /api/auth/me and updates context (the pattern
 *   repeated by nearly every dashboard mutation handler).
 */
export function useSingerUser() {
  const { currentUser, setCurrentUser, setView, showAlert } = useAppContext();
  const user = currentUser?.data || {};

  const refreshUser = async () => {
    const profileRes = await fetch("/api/auth/me", { credentials: "include" });
    const profile = await profileRes.json();
    setCurrentUser({ type: "singer", data: profile });
    return profile;
  };

  return { user, currentUser, setCurrentUser, setView, showAlert, refreshUser };
}
