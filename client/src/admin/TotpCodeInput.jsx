import React, { useCallback, useEffect, useRef, useState } from "react";

const LENGTH = 6;

/**
 * Six-digit TOTP input with paste support and auto-submit when complete.
 */
export function TotpCodeInput({
  onComplete,
  disabled = false,
  resetKey = 0,
  autoFocus = true,
  "data-testid": testId = "input-admin-mfa",
}) {
  const [digits, setDigits] = useState(() => Array(LENGTH).fill(""));
  const refs = useRef([]);

  useEffect(() => {
    setDigits(Array(LENGTH).fill(""));
    if (autoFocus) {
      requestAnimationFrame(() => refs.current[0]?.focus());
    }
  }, [resetKey, autoFocus]);

  const emitIfComplete = useCallback(
    (next) => {
      const code = next.join("");
      if (code.length === LENGTH && /^\d{6}$/.test(code)) {
        onComplete?.(code);
      }
    },
    [onComplete],
  );

  const applyDigits = (next, focusIndex) => {
    setDigits(next);
    if (focusIndex != null && focusIndex >= 0 && focusIndex < LENGTH) {
      requestAnimationFrame(() => refs.current[focusIndex]?.focus());
    }
    emitIfComplete(next);
  };

  const handleChange = (index, raw) => {
    if (disabled) return;
    const cleaned = raw.replace(/\D/g, "");
    if (!cleaned) {
      const next = [...digits];
      next[index] = "";
      applyDigits(next, index);
      return;
    }

    // Paste or multi-char into one box → fill forward
    if (cleaned.length > 1) {
      const next = [...digits];
      for (let i = 0; i < cleaned.length && index + i < LENGTH; i += 1) {
        next[index + i] = cleaned[i];
      }
      const filledTo = Math.min(index + cleaned.length, LENGTH) - 1;
      applyDigits(next, Math.min(filledTo + 1, LENGTH - 1));
      return;
    }

    const next = [...digits];
    next[index] = cleaned;
    applyDigits(next, index < LENGTH - 1 ? index + 1 : index);
  };

  const handleKeyDown = (index, e) => {
    if (disabled) return;
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...digits];
      if (next[index]) {
        next[index] = "";
        applyDigits(next, index);
      } else if (index > 0) {
        next[index - 1] = "";
        applyDigits(next, index - 1);
      }
      return;
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      refs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < LENGTH - 1) {
      e.preventDefault();
      refs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (index, e) => {
    if (disabled) return;
    e.preventDefault();
    const pasted = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, LENGTH);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < pasted.length && index + i < LENGTH; i += 1) {
      next[index + i] = pasted[i];
    }
    const focusAt = Math.min(index + pasted.length, LENGTH - 1);
    applyDigits(next, focusAt);
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-2.5" data-testid={testId} role="group" aria-label="6-digit authenticator code">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={(e) => handlePaste(index, e)}
          onFocus={(e) => e.target.select()}
          className="w-10 h-12 sm:w-11 sm:h-12 text-center text-lg font-semibold rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:opacity-50 disabled:bg-slate-50 tabular-nums"
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
}
