import React, { useState } from "react";
import { Youtube } from "lucide-react";
import { useSingerUser } from "../../hooks/useSingerUser";
import { describeError, getApiErrorMessage } from "../../../lib/api";

const HTTP_URL = /^https?:\/\//i;

function normalizeWebsite(value) {
  const trimmed = (value || "").trim();
  if (!trimmed) return "";
  return HTTP_URL.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function MediaLinksSection() {
  const { user, refreshUser } = useSingerUser();
  const [links, setLinks] = useState({
    website_url: user.website_url || "",
    video_link_1: user.video_link_1 || "",
    video_link_2: user.video_link_2 || "",
    audio_link_1: user.audio_link_1 || "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleSave = async () => {
    const mediaFields = [
      { key: "video_link_1", label: "YouTube or Vimeo link 1" },
      { key: "video_link_2", label: "YouTube or Vimeo link 2" },
      { key: "audio_link_1", label: "Audio / recording link" },
    ];
    for (const f of mediaFields) {
      if (links[f.key] && !HTTP_URL.test(links[f.key].trim())) {
        setMsg({
          type: "error",
          text: `${f.label} must start with http:// or https://`,
        });
        return;
      }
    }
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/singer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          website_url: normalizeWebsite(links.website_url),
          video_link_1: links.video_link_1.trim(),
          video_link_2: links.video_link_2.trim(),
          audio_link_1: links.audio_link_1.trim(),
        }),
      });
      if (!res.ok) {
        setMsg({
          type: "error",
          text: await getApiErrorMessage(res, "PROFILE_UPDATE_FAILED"),
        });
        setSaving(false);
        return;
      }
      await refreshUser();
      setMsg({ type: "success", text: "Links saved successfully." });
    } catch (err) {
      setMsg({
        type: "error",
        text: describeError(err, "PROFILE_UPDATE_FAILED"),
      });
    }
    setSaving(false);
  };

  const setField = (key) => (e) => {
    setMsg(null);
    setLinks((p) => ({ ...p, [key]: e.target.value }));
  };

  return (
    <div
      id="section-media-links"
      className="bg-white rounded-lg shadow mb-8 overflow-hidden scroll-mt-24"
      data-testid="section-media-links"
    >
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
        <h3 className="text-lg leading-6 font-medium text-slate-900 flex items-center gap-2">
          <Youtube className="w-5 h-5 text-slate-400" /> YouTube &amp; media links
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Add YouTube or Vimeo videos, an audio recording, and your website. Organizations see these on your public profile.
        </p>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Website URL <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            data-testid="input-website-url"
            type="url"
            value={links.website_url}
            onChange={setField("website_url")}
            placeholder="https://yourname.com"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-400 mt-1">
            e.g. yourname.com — we&apos;ll add https:// for you.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            YouTube or Vimeo URL
          </label>
          <input
            data-testid="input-video-link-1"
            type="url"
            value={links.video_link_1}
            onChange={setField("video_link_1")}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Second YouTube or Vimeo URL <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            data-testid="input-video-link-2"
            type="url"
            value={links.video_link_2}
            onChange={setField("video_link_2")}
            placeholder="https://vimeo.com/..."
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Audio / recording link <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            data-testid="input-audio-link-1"
            type="url"
            value={links.audio_link_1}
            onChange={setField("audio_link_1")}
            placeholder="https://soundcloud.com/..."
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <p className="text-xs text-slate-400">
          Video and audio links must start with http:// or https://. Leave any field blank to omit.
        </p>
        {msg && (
          <p
            className={`text-sm ${msg.type === "success" ? "text-emerald-600" : "text-red-600"}`}
            data-testid={msg.type === "success" ? "media-links-success" : "media-links-error"}
            role="status"
          >
            {msg.text}
          </p>
        )}
        <div className="flex justify-end">
          <button
            data-testid="button-save-media-links"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save Links"}
          </button>
        </div>
      </div>
    </div>
  );
}
