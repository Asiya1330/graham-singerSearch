import React, { useState } from "react";
import { CheckCircle } from "lucide-react";
import { useSingerUser } from "../../hooks/useSingerUser";

export function ResumeSection() {
  const { user, showAlert, refreshUser } = useSingerUser();
  const [resumeUploading, setResumeUploading] = useState(false);

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") { showAlert("Only PDF files are allowed", "error"); return; }
    if (file.size > 4 * 1024 * 1024) { showAlert("File must be under 4MB", "error"); return; }
    setResumeUploading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await fetch("/api/singer/resume", { method: "POST", credentials: "include", body: formData, signal: controller.signal });
      if (!res.ok) { const data = await res.json().catch(() => ({})); showAlert(data.message || "Upload failed", "error"); return; }
      await refreshUser();
      showAlert("Resume uploaded successfully", "success");
    } catch (err) {
      showAlert(err.name === "AbortError" ? "Upload timed out. Please try again." : "Failed to upload resume", "error");
    } finally {
      clearTimeout(timeout);
      setResumeUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
        <h3 className="text-lg leading-6 font-medium text-slate-900">Resume</h3>
        <p className="mt-1 text-sm text-slate-500">Upload your performance resume (PDF only, max 5MB).</p>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-4">
          <label
            data-testid="button-upload-resume"
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white cursor-pointer ${resumeUploading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {resumeUploading ? "Uploading…" : user.resume_url ? "Replace Resume" : "Upload Resume"}
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={handleResumeUpload}
              disabled={resumeUploading}
            />
          </label>
          {user.resume_url && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                <CheckCircle className="w-3.5 h-3.5" /> Resume uploaded
              </span>
              <a
                href={user.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
                data-testid="link-view-resume"
              >
                View PDF
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
