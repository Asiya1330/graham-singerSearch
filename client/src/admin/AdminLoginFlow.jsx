import React, { useCallback, useEffect, useRef, useState } from "react";
import { getSupabaseBrowser } from "../lib/supabase";
import { apiFetch, API_ERRORS } from "../lib/api";
import { messageFromAuthProviderError } from "@shared/auth-error-map";
import { ApiErrorText } from "../components/ApiErrorText";
import { TotpCodeInput } from "./TotpCodeInput";
import { PasswordInput } from "../components/PasswordInput";

/**
 * Admin login: email/password → MFA enroll or challenge → onSuccess when aal2 + server check.
 */
export function AdminLoginFlow({ onSuccess }) {
  const [step, setStep] = useState("password"); // password | enroll | challenge
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [factorId, setFactorId] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpResetKey, setOtpResetKey] = useState(0);
  const verifyingRef = useRef(false);

  const finishIfReady = async () => {
    const { data } = await apiFetch(
      "/api/admin/auth/check",
      {},
      "ADMIN_AUTH_REQUIRED",
    );
    if (data?.authenticated) {
      onSuccess(data);
      return true;
    }
    if (data?.mfaRequired) {
      setStep("challenge");
      return false;
    }
    setError(API_ERRORS.ADMIN_FORBIDDEN.message);
    return false;
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    setError("");
    try {
      const supabase = getSupabaseBrowser();
      const { error: signError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (signError) {
        throw new Error(messageFromAuthProviderError(signError, "admin"));
      }

      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const totpFactors = (factorsData?.totp || []).filter(
        (f) => f.status === "verified",
      );

      if (totpFactors.length === 0) {
        const { data: enrollData, error: enrollError } =
          await supabase.auth.mfa.enroll({
            factorType: "totp",
            friendlyName: "Admin authenticator",
          });
        if (enrollError) {
          throw new Error(messageFromAuthProviderError(enrollError, "admin"));
        }
        setFactorId(enrollData.id);
        setQrCode(enrollData.totp?.qr_code || null);
        setOtpResetKey((k) => k + 1);
        setStep("enroll");
        return;
      }

      const { data: aalData } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData?.currentLevel === "aal2") {
        await finishIfReady();
        return;
      }

      setFactorId(totpFactors[0].id);
      setOtpResetKey((k) => k + 1);
      setStep("challenge");
    } catch (err) {
      setError(err.message || API_ERRORS.LOGIN_FAILED.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyTotp = useCallback(
    async (code) => {
      if (!factorId || !code || code.length !== 6) return;
      if (verifyingRef.current) return;
      verifyingRef.current = true;
      setLoading(true);
      setError("");
      try {
        const supabase = getSupabaseBrowser();
        const { data: challenge, error: challengeError } =
          await supabase.auth.mfa.challenge({
            factorId,
          });
        if (challengeError) {
          throw new Error(messageFromAuthProviderError(challengeError, "admin"));
        }

        const { error: verifyError } = await supabase.auth.mfa.verify({
          factorId,
          challengeId: challenge.id,
          code,
        });
        if (verifyError) {
          throw new Error(messageFromAuthProviderError(verifyError, "admin"));
        }

        await finishIfReady();
      } catch (err) {
        setError(
          err.message ||
            "Invalid code. Try again with a fresh code from your app.",
        );
        setOtpResetKey((k) => k + 1);
      } finally {
        setLoading(false);
        verifyingRef.current = false;
      }
    },
    [factorId],
  );

  const cardMaxWidth = step === "enroll" ? "max-w-md" : "max-w-sm";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div
        className={`bg-white rounded-xl shadow-sm border border-slate-200 w-full ${cardMaxWidth} p-6 sm:p-8`}
      >
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-amber-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Admin Access</h1>
          <p className="text-sm text-slate-500 mt-1">
            {step === "password" && "Sign in with your admin email"}
            {step === "enroll" &&
              "Scan this QR code with your authenticator app, then enter the 6-digit code"}
            {step === "challenge" &&
              "Enter the 6-digit code from your authenticator app"}
          </p>
        </div>

        {step === "password" && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="admin@example.com"
                autoFocus
                data-testid="input-admin-email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Password"
                data-testid="input-admin-password"
              />
            </div>
            {error && (
              <ApiErrorText message={error} testId="admin-login-error" />
            )}
            <button
              type="submit"
              disabled={loading || !email.trim() || !password}
              className="w-full h-10 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
              data-testid="button-admin-login"
            >
              {loading ? "Signing in…" : "Continue"}
            </button>
          </form>
        )}

        {(step === "enroll" || step === "challenge") && (
          <div className="space-y-5">
            {step === "enroll" && qrCode && (
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <img
                    src={qrCode}
                    alt="MFA QR code — scan with your authenticator app"
                    className="w-64 h-64 sm:w-72 sm:h-72"
                  />
                </div>
                <p className="text-xs text-slate-500 text-center max-w-xs">
                  Use Google Authenticator, Authy, 1Password, or similar. Codes
                  refresh every 30 seconds.
                </p>
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700 text-center">
                6-digit code
              </label>
              <TotpCodeInput
                key={otpResetKey}
                resetKey={otpResetKey}
                disabled={loading}
                onComplete={verifyTotp}
                data-testid="input-admin-mfa"
              />
              {loading && (
                <p
                  className="text-center text-xs text-slate-500"
                  data-testid="admin-mfa-verifying"
                >
                  Verifying…
                </p>
              )}
              {error && (
                <ApiErrorText message={error} testId="admin-mfa-error" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminSetPasswordPage({ onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = getSupabaseBrowser();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!cancelled) setReady(!!session);
      } catch {
        if (!cancelled) setReady(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const supabase = getSupabaseBrowser();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) {
        throw new Error(messageFromAuthProviderError(updateError, "password"));
      }
      onDone?.();
    } catch (err) {
      setError(err.message || API_ERRORS.PASSWORD_RESET_FAILED.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 w-full max-w-sm p-6 sm:p-8">
        <h1 className="text-xl font-bold text-slate-900 mb-2">
          Set admin password
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          {ready
            ? "Choose a password for your admin account, then sign in and enroll MFA."
            : "Open the invite link from your email first so this page can set your password."}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={!ready}
            className="w-full rounded-lg border border-slate-200 px-3 h-10 text-sm"
            placeholder="New password"
          />
          <PasswordInput
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={!ready}
            className="w-full rounded-lg border border-slate-200 px-3 h-10 text-sm"
            placeholder="Confirm password"
          />
          {error && <ApiErrorText message={error} />}
          <button
            type="submit"
            disabled={!ready || loading}
            className="w-full h-10 bg-amber-600 text-white text-sm font-semibold rounded-lg disabled:opacity-60"
          >
            {loading ? "Saving…" : "Save password"}
          </button>
        </form>
      </div>
    </div>
  );
}
