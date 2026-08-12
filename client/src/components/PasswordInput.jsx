import React, { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Password field with a show/hide toggle.
 *
 * Drop-in for `<input type="password" />` — every prop is forwarded, so the
 * caller keeps control of styling, value, and handlers. The toggle is padded
 * into the field's right edge rather than layered over the text, so long
 * values never end up hidden behind the icon.
 *
 * The button is deliberately `tabIndex={-1}`: tabbing from a password field
 * should land on the submit button, not on a visibility control.
 */
export function PasswordInput({
  className = "",
  visibleByDefault = false,
  ...props
}) {
  const [visible, setVisible] = useState(visibleByDefault);
  const describedBy = useId();

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={`${className} pr-10`}
        aria-describedby={describedBy}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        title={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none cursor-pointer"
        data-testid={
          props["data-testid"]
            ? `${props["data-testid"]}-toggle`
            : "button-toggle-password"
        }
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
      <span id={describedBy} className="sr-only">
        {visible ? "Password is visible" : "Password is hidden"}
      </span>
    </div>
  );
}

export default PasswordInput;
