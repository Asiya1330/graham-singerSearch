import React from "react";

/**
 * Inline API error message — use with messages from lib/api.js or showAlert.
 */
export function ApiErrorText({ message, className = "text-sm text-red-600 font-medium", testId }) {
  if (!message) return null;
  return (
    <p className={className} data-testid={testId} role="alert">
      {message}
    </p>
  );
}
