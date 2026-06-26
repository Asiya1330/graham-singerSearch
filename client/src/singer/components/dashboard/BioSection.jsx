import React, { useState } from "react";
import { useSingerUser } from "../../hooks/useSingerUser";

const BIO_MAX_LENGTH = 1700;

export function BioSection() {
  const { user, showAlert, refreshUser } = useSingerUser();
  const [bioText, setBioText] = useState(user.short_bio || "");
  const [bioSaving, setBioSaving] = useState(false);

  const handleSaveBio = async () => {
    if (bioText.length > BIO_MAX_LENGTH) { showAlert(`Bio exceeds ${BIO_MAX_LENGTH} character limit`, "error"); return; }
    setBioSaving(true);
    try {
      const res = await fetch("/api/singer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ short_bio: bioText }),
      });
      if (!res.ok) { showAlert("Failed to save bio", "error"); setBioSaving(false); return; }
      await refreshUser();
      showAlert("Bio saved successfully", "success");
    } catch (err) {
      showAlert("Failed to save bio", "error");
    }
    setBioSaving(false);
  };

  return (
    <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
        <h3 className="text-lg leading-6 font-medium text-slate-900">Bio</h3>
        <p className="mt-1 text-sm text-slate-500">A short professional summary visible to organizations. Maximum {BIO_MAX_LENGTH} characters (~250 words).</p>
      </div>
      <div className="p-6">
        <textarea
          data-testid="input-bio"
          rows={4}
          className={`w-full rounded-md border shadow-sm focus:ring-blue-500 px-3 py-2 text-sm ${bioText.length > BIO_MAX_LENGTH ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'}`}
          placeholder="Describe your vocal background, training, and performing highlights..."
          value={bioText}
          onChange={(e) => setBioText(e.target.value)}
          maxLength={BIO_MAX_LENGTH}
        />
        <div className="mt-3 flex items-center justify-between">
          <span className={`text-xs font-medium ${bioText.length > BIO_MAX_LENGTH ? 'text-red-600' : bioText.length > BIO_MAX_LENGTH * 0.9 ? 'text-amber-600' : 'text-slate-400'}`}>
            {bioText.length} / {BIO_MAX_LENGTH} characters
            {bioText.length > BIO_MAX_LENGTH && <span className="ml-1">(limit exceeded)</span>}
          </span>
          <button
            data-testid="button-save-bio"
            onClick={handleSaveBio}
            disabled={bioSaving || bioText.length > BIO_MAX_LENGTH}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bioSaving ? "Saving…" : "Save Bio"}
          </button>
        </div>
      </div>
    </div>
  );
}
