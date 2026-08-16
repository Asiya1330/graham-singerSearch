import React, { useState, useEffect } from "react";
import { Search, Users } from "lucide-react";
import { useAppContext } from "./AppContext";
import { US_STATES } from "./AppShared";
import { useCityStateAutofill } from "./hooks/useCityStateAutofill";
import { navigateToView } from "./lib/nav";
import { apiFetch, API_ERRORS } from "./lib/api";
import { messageFromAuthProviderError } from "@shared/auth-error-map";
import {
  loginAccount,
  registerAccount,
  requestPasswordReset,
  userFromProfile,
} from "./lib/accountAuth";
import { getSupabaseBrowser, signOutEverywhere } from "./lib/supabase";
import { PasswordInput } from "./components/PasswordInput";

export function SingerLogin({ showAlert, setShowWelcome }) {
  const { setCurrentUser, setView } = useAppContext();

  const [email, setEmail] = useState(
    import.meta.env.DEV ? import.meta.env.VITE_DEMO_SINGER_EMAIL || "" : "",
  );
  const [password, setPassword] = useState(
    import.meta.env.DEV ? import.meta.env.VITE_DEMO_SINGER_PASSWORD || "" : "",
  );
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgotSubmit = async () => {
    if (!forgotEmail) return;
    setForgotLoading(true);
    try {
      await requestPasswordReset(forgotEmail, "singer");
      setForgotSubmitted(true);
    } catch (err) {
      showAlert(
        err.message || API_ERRORS.FORGOT_PASSWORD_FAILED.message,
        "error",
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const profile = await loginAccount(email, password, "singer");
      setCurrentUser(userFromProfile(profile));
      setView("singerDashboard", { replace: true });
      setShowWelcome(true);
    } catch (err) {
      showAlert(err.message || API_ERRORS.LOGIN_FAILED.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Users className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Or{" "}
          <button
            onClick={() => navigateToView(setView, "landing")}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            return home
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <div className="mt-1">
                <PasswordInput
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgot(true);
                    setForgotSubmitted(false);
                    setForgotEmail(email || "");
                  }}
                  className="text-xs font-medium text-blue-600 hover:text-blue-500"
                  data-testid="link-forgot-password"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>

          {showForgot && (
            <div className="mt-6 border-t border-slate-200 pt-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">
                Reset your password
              </h3>
              {forgotSubmitted ? (
                <div
                  className="bg-blue-50 border border-blue-200 rounded-md p-3"
                  data-testid="forgot-password-confirmation"
                >
                  <p className="text-sm text-blue-800">
                    If an account exists for that email, we sent password reset
                    instructions. Check your inbox and spam folder.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    data-testid="input-forgot-email"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleForgotSubmit}
                      disabled={!forgotEmail || forgotLoading}
                      className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                      data-testid="button-submit-forgot"
                    >
                      {forgotLoading ? "Sending..." : "Submit"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForgot(false)}
                      className="py-2 px-4 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Need an account?{" "}
              <button
                onClick={() => navigateToView(setView, "singerRegister")}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Register
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export function OrganizationLogin({ showAlert, setShowWelcome }) {
  const { setCurrentUser, setView } = useAppContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgotSubmit = async () => {
    if (!forgotEmail) return;
    setForgotLoading(true);
    try {
      await requestPasswordReset(forgotEmail, "organization");
      setForgotSubmitted(true);
    } catch (err) {
      showAlert(
        err.message || API_ERRORS.FORGOT_PASSWORD_FAILED.message,
        "error",
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const profile = await loginAccount(email, password, "organization");
      setCurrentUser(userFromProfile(profile));
      setView("orgDashboard", { replace: true });
      setShowWelcome(true);
    } catch (err) {
      showAlert(err.message || API_ERRORS.LOGIN_FAILED.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Search className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Organization Login
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Or{" "}
          <button
            onClick={() => navigateToView(setView, "landing")}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            return home
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <div className="mt-1">
                <PasswordInput
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgot(true);
                    setForgotSubmitted(false);
                    setForgotEmail(email || "");
                  }}
                  className="text-xs font-medium text-blue-600 hover:text-blue-500"
                  data-testid="link-forgot-password-org"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>

          {showForgot && (
            <div className="mt-6 border-t border-slate-200 pt-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">
                Reset your password
              </h3>
              {forgotSubmitted ? (
                <div
                  className="bg-blue-50 border border-blue-200 rounded-md p-3"
                  data-testid="forgot-password-confirmation-org"
                >
                  <p className="text-sm text-blue-800">
                    If an account exists for that email, we sent password reset
                    instructions. Check your inbox and spam folder.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    data-testid="input-forgot-email-org"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleForgotSubmit}
                      disabled={!forgotEmail || forgotLoading}
                      className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                      data-testid="button-submit-forgot-org"
                    >
                      {forgotLoading ? "Sending..." : "Submit"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForgot(false)}
                      className="py-2 px-4 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Need an account?{" "}
              <button
                onClick={() => navigateToView(setView, "orgRegister")}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Register
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Shown after sign-up when Supabase is holding the account for confirmation. */
export function ConfirmEmailNotice({ email, loginView }) {
  const { setView } = useAppContext();
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-slate-900">
          Check your email
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 space-y-4 text-center">
          <p
            className="text-sm text-slate-600"
            data-testid="confirm-email-notice"
          >
            We sent a confirmation link to{" "}
            <span className="font-medium text-slate-900">{email}</span>. Click
            it to activate your account, then sign in.
          </p>
          <p className="text-xs text-slate-500">
            Nothing yet? Check your spam folder — the link can take a minute to
            arrive.
          </p>
          <button
            onClick={() =>
              navigateToView(setView, loginView, { replace: true })
            }
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            data-testid="button-go-to-login"
          >
            Go to sign in
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Landing page for the Supabase recovery link.
 *
 * The link carries its tokens in the URL fragment; the Supabase client picks
 * them up automatically (detectSessionInUrl), which leaves us with a short-lived
 * recovery session. Having that session *is* the proof the link was valid, so
 * there is no token to validate against our own API any more.
 */
export function ResetPasswordPage({ showAlert }) {
  const { setView } = useAppContext();
  const params = new URLSearchParams(window.location.search);
  const userType =
    params.get("type") === "organization" ? "organization" : "singer";
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = getSupabaseBrowser();
        // detectSessionInUrl resolves the fragment asynchronously, so also
        // listen for PASSWORD_RECOVERY rather than only reading once.
        const { data } = await supabase.auth.getSession();
        if (!cancelled && data.session) {
          setTokenValid(true);
          setValidating(false);
          return;
        }
        const { data: sub } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (cancelled) return;
            if (
              session &&
              (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN")
            ) {
              setTokenValid(true);
              setValidating(false);
            }
          },
        );
        // Give the fragment a moment to resolve before declaring the link dead.
        setTimeout(() => {
          if (cancelled) return;
          sub?.subscription?.unsubscribe?.();
          setValidating(false);
        }, 3000);
      } catch {
        if (!cancelled) {
          setTokenValid(false);
          setValidating(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      showAlert("Password must be at least 8 characters", "error");
      return;
    }
    if (password !== confirmPassword) {
      showAlert("Passwords do not match", "error");
      return;
    }
    setLoading(true);
    try {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw new Error(messageFromAuthProviderError(error, "reset"));
      // Force a fresh sign-in with the new password rather than riding the
      // recovery session into the app.
      await signOutEverywhere();
      setSuccess(true);
    } catch (err) {
      showAlert(
        err.message || API_ERRORS.PASSWORD_RESET_FAILED.message,
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const loginView =
    userType === "organization" ? "organizationLogin" : "singerLogin";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-slate-900">
          Reset your password
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {validating ? (
            <p className="text-sm text-slate-600 text-center">
              Checking your reset link...
            </p>
          ) : success ? (
            <div className="space-y-4 text-center">
              <p
                className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-md p-3"
                data-testid="reset-password-success"
              >
                Your password has been updated. You can sign in with your new
                password.
              </p>
              <button
                onClick={() =>
                  navigateToView(setView, loginView, { replace: true })
                }
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                data-testid="button-go-to-login"
              >
                Go to sign in
              </button>
            </div>
          ) : !tokenValid ? (
            <div className="space-y-4 text-center">
              <p
                className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-md p-3"
                data-testid="reset-password-invalid"
              >
                This reset link is invalid or has expired. Request a new one
                from the sign-in page.
              </p>
              <button
                onClick={() =>
                  navigateToView(setView, loginView, { replace: true })
                }
                className="w-full py-2 px-4 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-sm font-medium text-slate-700"
                >
                  New password
                </label>
                <PasswordInput
                  id="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  data-testid="input-new-password"
                />
              </div>
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Confirm password
                </label>
                <PasswordInput
                  id="confirm-password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  data-testid="input-confirm-password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                data-testid="button-reset-password"
              >
                {loading ? "Updating..." : "Update password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function SingerRegistration({ showAlert, setShowWelcome }) {
  const { setCurrentUser, setView } = useAppContext();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    primary_voice_type: "",
    city: "",
    state: "",
  });
  const { stateAutoFilled, handleCityChange, handleStateChange } =
    useCityStateAutofill(setForm);
  const [loading, setLoading] = useState(false);

  const [pendingEmail, setPendingEmail] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await registerAccount("singer", form);
      if (result.confirmationRequired) {
        setPendingEmail(result.email);
        return;
      }
      setCurrentUser(userFromProfile(result.profile));
      setView("singerDashboard", { replace: true });
      setShowWelcome(true);
      showAlert("Account created successfully!", "success");
    } catch (err) {
      showAlert(err.message || API_ERRORS.REGISTRATION_FAILED.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (pendingEmail) {
    return <ConfirmEmailNotice email={pendingEmail} loginView="singerLogin" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Users className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Create Singer Account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <button
            onClick={() => navigateToView(setView, "singerLogin")}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </button>
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div
          className="mb-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-lg p-4"
          data-testid="banner-founding-singer"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">🌟</span>
            <div className="text-sm">
              <p className="font-bold text-amber-900">
                Founding Member spots are filling fast.
              </p>
              <p className="text-amber-800 mt-0.5">
                Register now to be considered for a{" "}
                <span className="font-bold">free year of Pro</span>.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleRegister}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={form.first_name}
                  onChange={(e) =>
                    setForm({ ...form, first_name: e.target.value })
                  }
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={form.last_name}
                  onChange={(e) =>
                    setForm({ ...form, last_name: e.target.value })
                  }
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <PasswordInput
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Voice Type
              </label>
              <select
                required
                value={form.primary_voice_type}
                onChange={(e) =>
                  setForm({ ...form, primary_voice_type: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
              >
                <option value="">Select voice type</option>
                <option value="Soprano">Soprano</option>
                <option value="Mezzo-Soprano">Mezzo-Soprano</option>
                <option value="Contralto">Contralto</option>
                <option value="Countertenor">Countertenor</option>
                <option value="Tenor">Tenor</option>
                <option value="Baritone">Baritone</option>
                <option value="Bass">Bass</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  City
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  data-testid="input-reg-city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
                  State
                  {stateAutoFilled && (
                    <span
                      className="text-[10px] font-normal text-slate-400 italic"
                      data-testid="label-state-autofilled"
                    >
                      auto-filled
                    </span>
                  )}
                </label>
                <select
                  value={form.state}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white ${stateAutoFilled ? "text-slate-500" : ""}`}
                  data-testid="select-reg-state"
                >
                  {US_STATES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
export function OrgRegistration({ showAlert, setShowWelcome }) {
  const { setCurrentUser, setView } = useAppContext();

  const [form, setForm] = useState({
    organization_name: "",
    email: "",
    password: "",
    organization_type: "",
    city: "",
    state: "",
  });
  const { stateAutoFilled, handleCityChange, handleStateChange } =
    useCityStateAutofill(setForm);
  const [loading, setLoading] = useState(false);

  const [pendingEmail, setPendingEmail] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await registerAccount("organization", form);
      if (result.confirmationRequired) {
        setPendingEmail(result.email);
        return;
      }
      setCurrentUser(userFromProfile(result.profile));
      setView("orgDashboard", { replace: true });
      setShowWelcome(true);
      showAlert("Organization account created!", "success");
    } catch (err) {
      showAlert(err.message || API_ERRORS.REGISTRATION_FAILED.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (pendingEmail) {
    return (
      <ConfirmEmailNotice email={pendingEmail} loginView="organizationLogin" />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Search className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Register Organization
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <button
            onClick={() => navigateToView(setView, "organizationLogin")}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </button>
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div
          className="mb-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-lg p-4"
          data-testid="banner-founding-org"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">🌟</span>
            <div className="text-sm">
              <p className="font-bold text-amber-900">
                Founding Member spots are filling fast.
              </p>
              <p className="text-amber-800 mt-0.5">
                Register now to be considered for a{" "}
                <span className="font-bold">free year of Pro</span>.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Organization Name
              </label>
              <input
                type="text"
                required
                value={form.organization_name}
                onChange={(e) =>
                  setForm({ ...form, organization_name: e.target.value })
                }
                className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <PasswordInput
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Organization Type
              </label>
              <select
                required
                value={form.organization_type}
                onChange={(e) =>
                  setForm({ ...form, organization_type: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
              >
                <option value="">Select type</option>
                <option value="Opera Company">Opera Company</option>
                <option value="Symphony">Symphony</option>
                <option value="Festival">Festival</option>
                <option value="Conservatory">Conservatory</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  City
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  data-testid="input-reg-city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
                  State
                  {stateAutoFilled && (
                    <span
                      className="text-[10px] font-normal text-slate-400 italic"
                      data-testid="label-state-autofilled"
                    >
                      auto-filled
                    </span>
                  )}
                </label>
                <select
                  value={form.state}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white ${stateAutoFilled ? "text-slate-500" : ""}`}
                  data-testid="select-reg-state"
                >
                  {US_STATES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
