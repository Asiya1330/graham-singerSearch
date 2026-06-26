import React, { useState } from "react";
import { Camera, UserX } from "lucide-react";
import { useSingerUser } from "../../hooks/useSingerUser";

export function ProfilePhotoSection() {
  const { user, showAlert, refreshUser } = useSingerUser();
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) { showAlert("Please upload a JPG, PNG, or WebP image", "error"); return; }
    if (file.size > 4 * 1024 * 1024) { showAlert("Photo must be under 4MB", "error"); return; }
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoUploading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const formData = new FormData();
      formData.append("headshot", file);
      const res = await fetch("/api/singer/headshot", { method: "POST", credentials: "include", body: formData, signal: controller.signal });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { showAlert(data.message || "Upload failed", "error"); return; }
      await refreshUser();
      showAlert("Profile photo updated!", "success");
    } catch (err) {
      showAlert(err.name === "AbortError" ? "Upload timed out. Please try again." : "Failed to upload photo", "error");
    } finally {
      clearTimeout(timeout);
      setPhotoUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
        <h3 className="text-lg leading-6 font-medium text-slate-900 flex items-center gap-2">
          <Camera className="w-5 h-5 text-slate-400" /> Profile Photo
        </h3>
        <p className="text-sm font-medium text-slate-700 mt-1">This is the first thing organizations see.</p>
        <p className="text-sm text-slate-500 mt-1">Your photo appears on search result cards and your public profile.</p>
      </div>
      <div className="px-6 py-6">
        <div className="flex items-center gap-6">
          <div className="relative flex-shrink-0">
            {photoPreview || user.headshot_url ? (
              <img
                src={photoPreview || user.headshot_url}
                alt="Profile photo"
                className="w-24 h-24 rounded-full object-cover border-2 border-slate-200 shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center border-2 border-slate-200">
                <UserX className="w-10 h-10 text-slate-400" />
              </div>
            )}
            {photoUploading && (
              <div className="absolute inset-0 rounded-full bg-white/70 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <label className="cursor-pointer" data-testid="label-photo-upload">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoUpload}
                disabled={photoUploading}
                data-testid="input-photo-upload"
              />
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors">
                <Camera className="w-4 h-4" />
                {user.headshot_url ? "Replace Photo" : "Upload Photo"}
              </span>
            </label>
            <p className="text-xs text-slate-400 mt-2">JPG, PNG or WebP · Max 5 MB</p>
          </div>
        </div>
      </div>
    </div>
  );
}
