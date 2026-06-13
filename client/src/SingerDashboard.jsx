import React, { useState, useEffect } from "react";
import { Award, BarChart2, Calendar, Camera, CheckCircle, ChevronRight, Edit2, Eye, Info, Shield, TrendingUp, Users, UserX, X, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RepertoireAutocomplete, { VOICE_TYPE_DB_TO_LABEL, CATEGORY_DB_TO_PERFTYPE } from "./RepertoireAutocomplete";
import singerSearchLogo from "@assets/Singer_Search_Logo_May_2026_1777734809747.png";
import { AppFooter } from "./AppShared";
import { useAppContext } from "./AppContext";

export function SingerDashboard({ setSearchResults, showAlert }) {
  const { currentUser, setCurrentUser, setView, setSelectedSinger } = useAppContext();
    const user = currentUser.data;
    const userAvails = user.availabilities || [];
    const isPro = user.subscription_tier === 'pro';
    
    const BIO_MAX_LENGTH = 1700;
    const [bioText, setBioText] = useState(user.short_bio || "");
    const [bioSaving, setBioSaving] = useState(false);
    const [availStart, setAvailStart] = useState("");
    const [availEnd, setAvailEnd] = useState("");
    const [availSaving, setAvailSaving] = useState(false);
    const [resumeUploading, setResumeUploading] = useState(false);
    const [editingRoleId, setEditingRoleId] = useState(null);
    const [editingWorkId, setEditingWorkId] = useState(null);
    const [photoUploading, setPhotoUploading] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [searchAppearances, setSearchAppearances] = useState(null);

    // Emergency / Short-Notice form state
    const [emForm, setEmForm] = useState({
      lead_time: user.emergency_lead_time_hours ?? "",
      radius: user.emergency_travel_radius_miles ?? "",
      modes: Array.isArray(user.emergency_travel_modes) ? user.emergency_travel_modes : [],
      notes: user.emergency_notes || "",
    });
    const [emSaving, setEmSaving] = useState(false);

    useEffect(() => {
      let cancelled = false;
      (async () => {
        try {
          const res = await fetch("/api/singer/search-appearances", { credentials: "include" });
          if (!res.ok) return;
          const data = await res.json();
          if (!cancelled) setSearchAppearances(data.count ?? 0);
        } catch (_) { /* silent */ }
      })();
      return () => { cancelled = true; };
    }, []);

    useEffect(() => {
      setEmForm({
        lead_time: user.emergency_lead_time_hours ?? "",
        radius: user.emergency_travel_radius_miles ?? "",
        modes: Array.isArray(user.emergency_travel_modes) ? user.emergency_travel_modes : [],
        notes: user.emergency_notes || "",
      });
    }, [
      user.emergency_lead_time_hours,
      user.emergency_travel_radius_miles,
      user.emergency_travel_modes,
      user.emergency_notes,
      user.emergency_opt_in,
    ]);

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
        const profileRes = await fetch("/api/auth/me", { credentials: "include" });
        const profile = await profileRes.json();
        setCurrentUser({ type: "singer", data: profile });
        showAlert("Bio saved successfully", "success");
      } catch (err) {
        showAlert("Failed to save bio", "error");
      }
      setBioSaving(false);
    };

    const handleResumeUpload = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.type !== "application/pdf") { showAlert("Only PDF files are allowed", "error"); return; }
      if (file.size > 5 * 1024 * 1024) { showAlert("File must be under 5MB", "error"); return; }
      setResumeUploading(true);
      try {
        const formData = new FormData();
        formData.append("resume", file);
        const res = await fetch("/api/singer/resume", { method: "POST", credentials: "include", body: formData });
        if (!res.ok) { const data = await res.json(); showAlert(data.message || "Upload failed", "error"); setResumeUploading(false); return; }
        const profileRes = await fetch("/api/auth/me", { credentials: "include" });
        const profile = await profileRes.json();
        setCurrentUser({ type: "singer", data: profile });
        showAlert("Resume uploaded successfully", "success");
      } catch (err) {
        showAlert("Failed to upload resume", "error");
      }
      setResumeUploading(false);
    };

    const handlePhotoUpload = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowed.includes(file.type)) { showAlert("Please upload a JPG, PNG, or WebP image", "error"); return; }
      if (file.size > 5 * 1024 * 1024) { showAlert("Photo must be under 5MB", "error"); return; }
      setPhotoPreview(URL.createObjectURL(file));
      setPhotoUploading(true);
      try {
        const formData = new FormData();
        formData.append("headshot", file);
        const res = await fetch("/api/singer/headshot", { method: "POST", credentials: "include", body: formData });
        const data = await res.json();
        if (!res.ok) { showAlert(data.message || "Upload failed", "error"); setPhotoUploading(false); return; }
        const profileRes = await fetch("/api/auth/me", { credentials: "include" });
        const profile = await profileRes.json();
        setCurrentUser({ type: "singer", data: profile });
        showAlert("Profile photo updated!", "success");
      } catch (err) {
        showAlert("Failed to upload photo", "error");
      }
      setPhotoUploading(false);
    };

    const handleRequestEmergency = async () => {
      try {
        const res = await fetch("/api/singer/request-emergency", { method: "POST", credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        const profileRes = await fetch("/api/auth/me", { credentials: "include" });
        const profile = await profileRes.json();
        setCurrentUser({ type: "singer", data: profile });
        showAlert("Urgent availability signal submitted for admin review.", "success");
      } catch (err) {
        showAlert(err.message || "Failed to submit request", "error");
      }
    };

    const handleEditRole = (role) => {
      setEditingRoleId(role.id);
      setNewRole({
        role_name: role.role_name || "",
        work_title: role.work_title || "",
        composer: role.composer || "",
        languages: role.languages || [],
        other_language: "",
        performance_types: role.performance_types || [],
        experience_depth: role.experience_depth || "",
        last_performed_date: role.last_performed_date || "",
        notable_companies: (role.notable_companies || []).join(", "),
        notes: "",
        status: role.status || "performed",
      });
      setIsAddingRole(true);
    };

    const handleUpdateRole = async () => {
      if (!newRole.role_name || !newRole.work_title) { showAlert("Please fill in role and work title", "error"); return; }
      const languages = newRole.languages.includes("Other") && newRole.other_language
        ? [...newRole.languages.filter(l => l !== "Other"), newRole.other_language]
        : newRole.languages;
      try {
        const res = await fetch(`/api/singer/roles/${editingRoleId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            role_name: newRole.role_name,
            work_title: newRole.work_title,
            composer: newRole.composer,
            languages,
            performance_types: newRole.performance_types,
            experience_depth: newRole.experience_depth,
            last_performed_date: newRole.last_performed_date,
            notable_companies: newRole.notable_companies ? newRole.notable_companies.split(",").map(s => s.trim()).filter(Boolean) : [],
            status: newRole.status || "performed",
          }),
        });
        if (!res.ok) { showAlert("Failed to update role", "error"); return; }
        const profileRes = await fetch("/api/auth/me", { credentials: "include" });
        const profile = await profileRes.json();
        setCurrentUser({ type: "singer", data: profile });
        setIsAddingRole(false);
        setEditingRoleId(null);
        setNewRole({ role_name: "", work_title: "", composer: "", languages: [], other_language: "", performance_types: [], experience_depth: "", last_performed_date: "", notable_companies: "", notes: "", status: "performed" });
        showAlert("Role updated successfully", "success");
      } catch (err) {
        showAlert("Failed to update role", "error");
      }
    };

    const handleAddAvailability = async () => {
      if (!availStart || !availEnd) { showAlert("Please select both start and end dates", "error"); return; }
      if (new Date(availEnd) <= new Date(availStart)) { showAlert("End date must be after start date", "error"); return; }
      setAvailSaving(true);
      try {
        const res = await fetch("/api/singer/availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ start_date: availStart, end_date: availEnd }),
        });
        if (!res.ok) { showAlert("Failed to add availability", "error"); setAvailSaving(false); return; }
        const profileRes = await fetch("/api/auth/me", { credentials: "include" });
        const profile = await profileRes.json();
        setCurrentUser({ type: "singer", data: profile });
        setAvailStart("");
        setAvailEnd("");
        showAlert("Availability window added", "success");
      } catch (err) {
        showAlert("Failed to add availability", "error");
      }
      setAvailSaving(false);
    };

    const handleDeleteAvailability = async (availId) => {
      try {
        const res = await fetch(`/api/singer/availability/${availId}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) { showAlert("Failed to remove availability", "error"); return; }
        const profileRes = await fetch("/api/auth/me", { credentials: "include" });
        const profile = await profileRes.json();
        setCurrentUser({ type: "singer", data: profile });
        showAlert("Availability removed", "success");
      } catch (err) {
        showAlert("Failed to remove availability", "error");
      }
    };

    const handleDeleteRole = async (roleId) => {
      if (!confirm("Delete this role from your profile?")) return;
      try {
        const res = await fetch(`/api/singer/roles/${roleId}`, { method: "DELETE", credentials: "include" });
        if (!res.ok) { showAlert("Failed to delete role", "error"); return; }
        const profileRes = await fetch("/api/auth/me", { credentials: "include" });
        const profile = await profileRes.json();
        setCurrentUser({ type: "singer", data: profile });
        showAlert("Role removed", "success");
      } catch (err) {
        showAlert("Failed to delete role", "error");
      }
    };

    const handleEditWork = (work) => {
      setEditingWorkId(work.id);
      const knownLangs = ['Latin', 'German', 'English', 'French', 'Italian'];
      const langArr = Array.isArray(work.languages) ? work.languages : [];
      const standard = langArr.filter(l => knownLangs.includes(l));
      const other = langArr.find(l => !knownLangs.includes(l)) || "";
      const knownContexts = ['Orchestra', 'Oratorio', 'Symphonic Chorus', 'Recital', 'Church'];
      const ctx = knownContexts.includes(work.context) ? work.context : (work.context ? 'Other' : 'Orchestra');
      const otherCtx = knownContexts.includes(work.context) ? "" : (work.context || "");
      setNewWork({
        work_title: work.work_title || "",
        composer: work.composer || "",
        part_name: work.part_name || "",
        context: ctx,
        other_context: otherCtx,
        languages: other ? [...standard, "Other"] : standard,
        other_language: other,
        experience_depth: work.experience_depth || "",
        last_performed_date: work.last_performed_date || "",
        notable_ensembles: (work.notable_ensembles || []).join(", "),
        notes: work.notes || "",
        status: work.status || "performed",
      });
      setIsAddingWork(true);
    };

    const handleUpdateWork = async () => {
      if (!newWork.work_title) { showAlert("Please fill in work title", "error"); return; }
      const languages = newWork.languages.includes("Other") && newWork.other_language
        ? [...newWork.languages.filter(l => l !== "Other"), newWork.other_language]
        : newWork.languages;
      const context = newWork.context === "Other" && newWork.other_context ? newWork.other_context : newWork.context;
      try {
        const res = await fetch(`/api/singer/works/${editingWorkId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            work_title: newWork.work_title,
            composer: newWork.composer,
            part_name: newWork.part_name,
            context,
            languages,
            experience_depth: newWork.experience_depth,
            last_performed_date: newWork.last_performed_date,
            notable_ensembles: newWork.notable_ensembles
              ? newWork.notable_ensembles.split(",").map(s => s.trim()).filter(Boolean)
              : [],
            status: newWork.status || "performed",
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          showAlert(err.message || "Failed to update work", "error");
          return;
        }
        const profileRes = await fetch("/api/auth/me", { credentials: "include" });
        const profile = await profileRes.json();
        setCurrentUser({ type: "singer", data: profile });
        setIsAddingWork(false);
        setEditingWorkId(null);
        setNewWork({ work_title: "", composer: "", part_name: "", context: "Orchestra", other_context: "", languages: [], other_language: "", experience_depth: "", last_performed_date: "", notable_ensembles: "", notes: "", status: "performed" });
        showAlert("Work updated successfully", "success");
      } catch (err) {
        showAlert("Failed to update work", "error");
      }
    };

    const handleDeleteWork = async (workId) => {
      if (!confirm("Delete this work from your profile?")) return;
      try {
        const res = await fetch(`/api/singer/works/${workId}`, { method: "DELETE", credentials: "include" });
        if (!res.ok) { showAlert("Failed to delete work", "error"); return; }
        const profileRes = await fetch("/api/auth/me", { credentials: "include" });
        const profile = await profileRes.json();
        setCurrentUser({ type: "singer", data: profile });
        showAlert("Work removed", "success");
      } catch (err) {
        showAlert("Failed to delete work", "error");
      }
    };

    // Role/Work Entry State
    const [isAddingRole, setIsAddingRole] = useState(false);
    const [isAddingWork, setIsAddingWork] = useState(false);

    // Suggest a Work or Role (inline form)
    const [isSuggestingRepertoire, setIsSuggestingRepertoire] = useState(false);
    const [suggestForm, setSuggestForm] = useState({ work_title: "", composer: "", role_name: "", notes: "" });
    const [suggestSubmitting, setSuggestSubmitting] = useState(false);
    const [suggestSuccess, setSuggestSuccess] = useState(false);
    const [suggestError, setSuggestError] = useState("");
    const submitRepertoireSuggestion = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setSuggestError("");
        if (!suggestForm.work_title.trim()) {
            setSuggestError("Work title is required.");
            return;
        }
        setSuggestSubmitting(true);
        try {
            const res = await fetch("/api/suggest-repertoire", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    work_title: suggestForm.work_title.trim(),
                    composer: suggestForm.composer.trim() || null,
                    role_name: suggestForm.role_name.trim() || null,
                    notes: suggestForm.notes.trim() || null,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Failed to submit suggestion");
            }
            setSuggestForm({ work_title: "", composer: "", role_name: "", notes: "" });
            setSuggestSuccess(true);
            setTimeout(() => setSuggestSuccess(false), 4000);
        } catch (err) {
            setSuggestError(err.message || "Failed to submit suggestion");
        } finally {
            setSuggestSubmitting(false);
        }
    };
    
    // Role Form State
    const [newRole, setNewRole] = useState({
        role_name: "",
        work_title: "",
        composer: "",
        languages: [],
        other_language: "",
        performance_types: [], // fully_staged, concert, cover
        experience_depth: "",
        last_performed_date: "",
        notable_companies: "",
        notes: "",
        status: "performed",
    });
    
    // Work Form State
    const [newWork, setNewWork] = useState({
        work_title: "",
        composer: "",
        part_name: "",
        context: "Orchestra", // Orchestra, Chorus, Recital...
        other_context: "",
        languages: [],
        other_language: "",
        experience_depth: "",
        last_performed_date: "",
        notable_ensembles: "",
        notes: "",
        status: "performed",
    });

    const handleSaveRole = async () => {
        if(!newRole.role_name || !newRole.work_title) {
            showAlert("Please fill in role and work title", "error");
            return;
        }
        const languages = newRole.languages.includes("Other") && newRole.other_language 
           ? [...newRole.languages.filter(l => l !== "Other"), newRole.other_language] 
           : newRole.languages;
        
        try {
          const res = await fetch("/api/singer/roles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              role_name: newRole.role_name,
              work_title: newRole.work_title,
              composer: newRole.composer,
              languages,
              performance_types: newRole.performance_types,
              experience_depth: newRole.experience_depth,
              last_performed_date: newRole.last_performed_date,
              notable_companies: newRole.notable_companies ? newRole.notable_companies.split(",").map(s => s.trim()).filter(Boolean) : [],
              status: newRole.status || "performed",
            }),
          });
          if (!res.ok) { showAlert("Failed to add role", "error"); return; }
          
          const profileRes = await fetch("/api/auth/me", { credentials: "include" });
          const profile = await profileRes.json();
          setCurrentUser({ type: "singer", data: profile });
          
          setIsAddingRole(false);
          setNewRole({ role_name: "", work_title: "", composer: "", languages: [], other_language: "", performance_types: [], experience_depth: "", last_performed_date: "", notable_companies: "", notes: "", status: "performed" });
          showAlert("Opera role added to your profile", "success");
        } catch (err) {
          showAlert("Failed to add role", "error");
        }
    };

    const handleSaveWork = async () => {
        if(!newWork.work_title) {
            showAlert("Please fill in work title", "error");
            return;
        }
        const languages = newWork.languages.includes("Other") && newWork.other_language 
           ? [...newWork.languages.filter(l => l !== "Other"), newWork.other_language] 
           : newWork.languages;
        const context = newWork.context === "Other" && newWork.other_context ? newWork.other_context : newWork.context;
        
        try {
          const res = await fetch("/api/singer/works", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              work_title: newWork.work_title,
              composer: newWork.composer,
              part_name: newWork.part_name,
              context,
              languages,
              experience_depth: newWork.experience_depth,
              last_performed_date: newWork.last_performed_date,
              notable_ensembles: newWork.notable_ensembles
                ? newWork.notable_ensembles.split(",").map(s => s.trim()).filter(Boolean)
                : [],
              status: newWork.status || "performed",
            }),
          });
          if (!res.ok) { showAlert("Failed to add work", "error"); return; }
          
          const profileRes = await fetch("/api/auth/me", { credentials: "include" });
          const profile = await profileRes.json();
          setCurrentUser({ type: "singer", data: profile });
          
          setIsAddingWork(false);
          setNewWork({ work_title: "", composer: "", part_name: "", context: "Orchestra", other_context: "", languages: [], other_language: "", experience_depth: "", last_performed_date: "", notable_ensembles: "", notes: "", status: "performed" });
          showAlert("Work added to your profile", "success");
        } catch (err) {
          showAlert("Failed to add work", "error");
        }
    };

    const toggleLanguage = (lang, isRole) => {
        if (isRole) {
            const langs = newRole.languages.includes(lang) 
                ? newRole.languages.filter(l => l !== lang)
                : [...newRole.languages, lang];
            setNewRole({...newRole, languages: langs});
        } else {
             const langs = newWork.languages.includes(lang) 
                ? newWork.languages.filter(l => l !== lang)
                : [...newWork.languages, lang];
            setNewWork({...newWork, languages: langs});
        }
    };

    const togglePerfType = (type) => {
        const types = newRole.performance_types.includes(type)
            ? newRole.performance_types.filter(t => t !== type)
            : [...newRole.performance_types, type];
        setNewRole({...newRole, performance_types: types});
    };

    return (
      <div className="min-h-screen bg-slate-50 pb-12">
        <nav className="bg-[#121212] border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-14">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center cursor-pointer pr-6" onClick={() => setView("landing")}>
                  <img src={singerSearchLogo} alt="SingerSearch" className="h-10 object-contain brightness-0 invert" />
                </div>
                <div className="hidden sm:flex sm:space-x-6">
                  <span className="border-[#3B82F6] text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Dashboard
                  </span>
                  <span
                    className="text-white/40 hover:text-white/80 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium cursor-pointer transition-colors"
                    onClick={() => { setSelectedSinger({ ...user, previewMode: true }); setView("profileView"); }}
                    data-testid="link-preview-my-profile"
                  >
                    Preview My Profile
                  </span>
                  <span className="text-white/40 hover:text-white/80 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium cursor-pointer transition-colors" onClick={() => { setView("singerSettings"); setTimeout(() => { const el = document.getElementById("singer-subscription-section"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100); }} data-testid="link-my-subscription-dashboard">
                    My Subscription
                  </span>
                  <span className="text-white/40 hover:text-white/80 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium cursor-pointer transition-colors" onClick={() => setView("singerSettings")}>
                    Account &amp; Profile
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {!isPro && (
                    <button 
                        onClick={() => setView("pricing")}
                        className="text-xs font-semibold text-white bg-[#3B82F6] hover:bg-blue-500 px-3 py-1.5 rounded transition-colors"
                    >
                        Upgrade to Pro
                    </button>
                )}
                <div className="flex items-center">
                    <span className="text-white/50 text-sm font-medium mr-4">
                    {user.first_name} {user.last_name}
                    </span>
                    <button
                    onClick={async () => {
                        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
                        setCurrentUser(null);
                        setSearchResults([]);
                        setView("landing");
                    }}
                    className="text-white/30 hover:text-white/60 text-sm transition-colors"
                    >
                    Sign out
                    </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {!user.admin_approved && user.admin_rejected && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-8 flex items-start gap-3" data-testid="rejected-banner">
              <Info className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">
                Your profile was not approved. Please contact us for assistance.
              </p>
            </div>
          )}

          {!user.admin_approved && !user.admin_rejected && (
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-8 flex items-start gap-3" data-testid="pending-approval-banner">
              <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                Your profile is pending approval. You will appear in search once an administrator approves your account.
              </p>
            </div>
          )}

          {user.founding_artist && user.subscription_tier === 'pro' && user.pro_expires_at && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 rounded-lg p-4 mb-4 flex items-start gap-3" data-testid="banner-founding-singer-dashboard">
              <span className="text-2xl leading-none flex-shrink-0">🌟</span>
              <div className="text-sm">
                <p className="font-bold text-amber-900">Founding Singer — Pro access free until {new Date(user.pro_expires_at).toLocaleDateString()}</p>
                <p className="text-amber-800 mt-0.5">Thank you for joining as a founding member. You have full Pro access at no cost.</p>
              </div>
            </div>
          )}

          {user.is_gifted && !user.founding_artist && user.subscription_tier === 'pro' && user.pro_expires_at && (
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-300 rounded-lg p-4 mb-4 flex items-start gap-3" data-testid="banner-gifted-singer-dashboard">
              <span className="text-2xl leading-none flex-shrink-0">🎁</span>
              <div className="text-sm">
                <p className="font-bold text-violet-900">Pro access gifted by SingerSearch — active until {new Date(user.pro_expires_at).toLocaleDateString()}</p>
                <p className="text-violet-800 mt-0.5">Enjoy your complimentary Pro features.</p>
              </div>
            </div>
          )}

          {user.admin_approved && !user.approval_seen && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-4 mb-8 flex items-start gap-3" data-testid="approval-banner">
              <span className="text-2xl leading-none flex-shrink-0">🎉</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-emerald-900">Your profile has been approved — you are now visible in search results</p>
              </div>
              <button
                onClick={async () => {
                  try {
                    await fetch("/api/singer/approval-seen", { method: "PUT", credentials: "include" });
                    const profileRes = await fetch("/api/auth/me", { credentials: "include" });
                    const profile = await profileRes.json();
                    setCurrentUser({ type: "singer", data: profile });
                  } catch (err) { /* silent */ }
                }}
                className="text-emerald-700 hover:text-emerald-900 text-sm font-medium px-3 py-1 rounded hover:bg-emerald-100 transition-colors flex-shrink-0"
                data-testid="button-dismiss-approval"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Reputation Stats Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-500" /> How Organizations See You
            </h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[120px]">
                {(user.total_gigs || 0) >= 3 ? (
                  <>
                    <p className="text-3xl font-bold text-blue-600">{user.reliability_score || 0}%</p>
                    <p className="text-xs text-slate-500 mt-0.5">Reliability Score</p>
                    <p className="text-xs text-slate-400">Based on {user.total_gigs} verified engagements</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-semibold text-slate-400">No data yet</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {(user.total_gigs || 0) > 0 ? `${user.total_gigs} engagement${user.total_gigs === 1 ? '' : 's'} — need 3 minimum` : 'Reliability score appears after 3 verified engagements'}
                    </p>
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-2 items-start">
                {user.is_pro_verified ? (
                  <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full text-xs font-bold">
                    <Award className="w-3.5 h-3.5" /> Verified Pro
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-400 px-2.5 py-1 rounded-full text-xs">
                    Verified Pro (not yet)
                  </span>
                )}
                {user.is_emergency_ready ? (
                  <div className="inline-flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-xs font-bold">
                      <Zap className="w-3.5 h-3.5" /> Available for Short-Notice Engagements
                    </span>
                    <button
                      onClick={async () => {
                        if (!window.confirm("Opt out of Short-Notice Engagements? Your profile will no longer appear in urgent searches.")) return;
                        try {
                          const res = await fetch("/api/singer/emergency/opt-out", {
                            method: "POST",
                            credentials: "include",
                          });
                          if (!res.ok) { showAlert("Failed to opt out", "error"); return; }
                          const profileRes = await fetch("/api/auth/me", { credentials: "include" });
                          const profile = await profileRes.json();
                          setCurrentUser({ type: "singer", data: profile });
                          showAlert("Opted out of Short-Notice Engagements.", "success");
                        } catch (err) {
                          showAlert("Failed to opt out", "error");
                        }
                      }}
                      className="text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-3 py-1 rounded transition-colors"
                      data-testid="button-optout-emergency"
                    >
                      Opt Out
                    </button>
                  </div>
                ) : user.emergency_status_requested ? (
                  <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5" data-testid="status-emergency-pending">
                    <span className="inline-flex items-center gap-1 text-amber-800 text-xs font-bold">
                      <Zap className="w-3.5 h-3.5" /> Emergency Status Request Pending
                    </span>
                    <span className="text-[10px] text-amber-700">Awaiting admin review</span>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch("/api/singer/profile", {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({ emergency_status_requested: false }),
                          });
                          if (!res.ok) { showAlert("Failed to cancel request", "error"); return; }
                          const profileRes = await fetch("/api/auth/me", { credentials: "include" });
                          const profile = await profileRes.json();
                          setCurrentUser({ type: "singer", data: profile });
                          showAlert("Urgent request cancelled.", "success");
                        } catch (err) {
                          showAlert("Failed to cancel request", "error");
                        }
                      }}
                      className="text-xs font-medium text-amber-700 hover:text-red-700 hover:bg-red-50 px-2 py-0.5 rounded transition-colors"
                      data-testid="button-cancel-emergency-request"
                    >
                      Cancel Request
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleRequestEmergency}
                    className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-1.5 rounded-lg text-xs shadow-sm transition-colors"
                    data-testid="button-request-emergency"
                  >
                    <Zap className="w-3.5 h-3.5" /> Opt In to Short-Notice Engagements
                  </button>
                )}
                {user.is_management_verified ? (
                  <span className="inline-flex items-center gap-1 bg-violet-100 text-violet-800 px-2.5 py-1 rounded-full text-xs font-bold">
                    <Shield className="w-3.5 h-3.5" /> Management Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-400 px-2.5 py-1 rounded-full text-xs">
                    Management Verified (not yet)
                  </span>
                )}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3">
              {[
                { tier: 1, label: "Self-Reported", color: "bg-slate-100 text-slate-500" },
                { tier: 2, label: "Partially Verified", color: "bg-blue-100 text-blue-700" },
                { tier: 3, label: "Verified", color: "bg-emerald-100 text-emerald-700" },
              ].map(({ tier, label, color }) => (
                <span key={tier} className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${(user.confidence_tier || 1) === tier ? color : 'bg-slate-50 text-slate-300 line-through'}`}>
                  {label}
                </span>
              ))}
              <span className="text-xs text-slate-400 ml-auto">Confidence Tier {user.confidence_tier || 1} of 3</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Badges and scores are verified by SingerSearch administrators.</p>
          </div>

          {/* Pricing Banner for Free Users */}
          {!isPro && (
              <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-indigo-900 rounded-xl shadow-xl overflow-hidden mb-8 text-white relative"
              >
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Zap className="w-64 h-64 transform -rotate-12 translate-x-12 -translate-y-12" />
                  </div>
                  <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                      <div>
                          <div className="flex items-center gap-2 mb-2">
                              <span className="bg-yellow-400 text-indigo-900 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide">Limited Visibility</span>
                          </div>
                          <h2 className="text-2xl font-bold mb-2">Don't miss your next role.</h2>
                          <p className="text-indigo-200 text-lg max-w-2xl">
                              You are currently on the Free plan. Upgrade to Pro for <span className="text-white font-bold">$9.99/month</span> to appear in "Urgent Ready" searches and see who is viewing your profile.
                          </p>
                      </div>
                      <div className="flex-shrink-0">
                          <button 
                              onClick={() => setView("pricing")}
                              className="bg-white text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-lg font-bold shadow-lg transition-colors flex items-center gap-2"
                          >
                              View Pro Benefits <ChevronRight className="w-4 h-4" />
                          </button>
                      </div>
                  </div>
              </motion.div>
          )}

          {/* Profile Completion Banner */}
          {(() => {
            const fields = [
              { label: "Voice type", done: !!user.primary_voice_type },
              { label: "Location", done: !!(user.city && user.state) },
              { label: "Bio", done: !!user.short_bio },
              { label: "Headshot", done: !!user.headshot_url },
              { label: "At least one role", done: (user.roles?.length || 0) > 0 },
              { label: "At least one work", done: (user.works?.length || 0) > 0 },
              { label: "Availability", done: (user.availabilities?.length || 0) > 0 },
            ];
            const completed = fields.filter(f => f.done).length;
            const pct = Math.round((completed / fields.length) * 100);
            const incomplete = fields.filter(f => !f.done);
            if (pct >= 100) return null;
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50 border border-amber-200 rounded-xl shadow-sm p-5 mb-8"
                data-testid="profile-completion-banner"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-amber-700 font-bold text-sm">{pct}%</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-slate-900 font-semibold text-lg mb-1">
                      Your profile is {pct}% complete
                    </h3>
                    <p className="text-slate-600 text-sm mb-3">
                      {pct < 50
                        ? "Complete your profile to appear in searches. Organizations can't find you without these details."
                        : "Almost there! Add the remaining items to maximize your visibility in search results."}
                    </p>
                    <div className="w-full bg-amber-100 rounded-full h-2 mb-3">
                      <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {incomplete.map((f) => (
                        <span key={f.label} className="inline-flex items-center gap-1 text-xs bg-white border border-amber-200 text-amber-800 px-2 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                          {f.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* Profile Photo Section */}
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

          {/* Bio Section */}
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

          {/* Resume Upload Section */}
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

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Eye className="h-6 w-6 text-slate-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-slate-500 truncate">Profile Views</dt>
                      <dd>
                        <div className="text-lg font-medium text-slate-900" data-testid="text-profile-views">{user.viewed_count}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-6 w-6 text-slate-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-slate-500 truncate">Active Availabilities</dt>
                      <dd>
                        <div className="text-lg font-medium text-slate-900">{userAvails.length}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </motion.div>
             <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-slate-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-slate-500 truncate">Search Appearances</dt>
                      <dd>
                        {searchAppearances === null ? (
                          <div className="text-sm font-medium text-slate-400">…</div>
                        ) : (
                          <div className="text-lg font-medium text-slate-900" data-testid="text-search-appearances">
                            {searchAppearances}
                            <span className="ml-1 text-xs font-normal text-slate-500">last 30 days</span>
                          </div>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Availability Section */}
          <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg leading-6 font-medium text-slate-900">Availability</h3>
                <p className="mt-1 text-sm text-slate-500">Add date windows when you are available for engagements.</p>
              </div>
              <div className="flex items-center gap-4">
                <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-full border transition-all ${isPro ? 'bg-amber-50 border-amber-200 hover:bg-amber-100' : 'bg-slate-50 border-slate-200 opacity-75'}`} title="You may be contacted on short notice for last-minute replacements.">
                  <input
                    type="checkbox"
                    disabled={!isPro}
                    checked={isPro && user.emergency_opt_in}
                    onChange={async (e) => {
                      if (!isPro) return;
                      const newVal = e.target.checked;
                      try {
                        const body = newVal
                          ? {
                              opt_in: true,
                              lead_time: user.emergency_lead_time_hours,
                              radius: user.emergency_travel_radius_miles,
                              modes: user.emergency_travel_modes,
                              notes: user.emergency_notes,
                            }
                          : { opt_in: false, lead_time: null, radius: null, modes: null, notes: null };
                        await fetch("/api/singer/emergency", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          credentials: "include",
                          body: JSON.stringify(body),
                        });
                        const profileRes = await fetch("/api/auth/me", { credentials: "include" });
                        const profile = await profileRes.json();
                        setCurrentUser({ type: "singer", data: profile });
                      } catch (err) {
                        showAlert("Failed to update urgent settings", "error");
                      }
                    }}
                    className="rounded border-amber-300 text-amber-600 focus:ring-amber-500 disabled:cursor-not-allowed"
                  />
                  <div>
                    <span className={`text-sm font-bold flex items-center gap-1 ${isPro ? 'text-amber-800' : 'text-slate-500'}`}>
                      <Zap className="w-3 h-3" /> Available for Short-Notice Engagements
                    </span>
                    {!isPro && <div className="text-[10px] text-blue-600 font-medium cursor-pointer" onClick={() => setView("pricing")}>Upgrade to enable</div>}
                  </div>
                </label>
              </div>
            </div>

            {isPro && user.emergency_opt_in && (
              <div className="px-6 py-5 border-b border-amber-200 bg-amber-50/40">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">Minimum Lead Time</label>
                    <select
                      data-testid="select-em-lead-time"
                      value={emForm.lead_time ?? ""}
                      onChange={(e) => setEmForm(f => ({ ...f, lead_time: e.target.value === "" ? "" : parseInt(e.target.value, 10) }))}
                      className="w-full rounded-md border border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 h-10 px-3 text-sm"
                    >
                      <option value="">No minimum</option>
                      <option value="6">6 hours</option>
                      <option value="12">12 hours</option>
                      <option value="24">24 hours (1 day)</option>
                      <option value="48">48 hours (2 days)</option>
                      <option value="72">72 hours (3 days)</option>
                      <option value="168">1 week</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">Travel Radius (miles)</label>
                    <input
                      data-testid="input-em-radius"
                      type="number"
                      min="0"
                      step="10"
                      placeholder="e.g. 100"
                      value={emForm.radius ?? ""}
                      onChange={(e) => setEmForm(f => ({ ...f, radius: e.target.value === "" ? "" : parseInt(e.target.value, 10) }))}
                      className="w-full rounded-md border border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 h-10 px-3 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">Travel Modes</label>
                    <div className="flex flex-wrap gap-2">
                      {["Car", "Train", "Plane"].map(mode => {
                        const checked = emForm.modes.includes(mode);
                        return (
                          <label key={mode} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer ${checked ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'}`}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => setEmForm(f => ({
                                ...f,
                                modes: f.modes.includes(mode) ? f.modes.filter(m => m !== mode) : [...f.modes, mode],
                              }))}
                              className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                              data-testid={`checkbox-em-mode-${mode.toLowerCase()}`}
                            />
                            {mode}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">Notes for Organizations</label>
                    <textarea
                      data-testid="input-em-notes"
                      rows={2}
                      placeholder="e.g. Available evenings/weekends; can travel within New England."
                      value={emForm.notes}
                      onChange={(e) => setEmForm(f => ({ ...f, notes: e.target.value }))}
                      className="w-full rounded-md border border-slate-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    data-testid="button-save-emergency-settings"
                    disabled={emSaving}
                    onClick={async () => {
                      setEmSaving(true);
                      try {
                        const res = await fetch("/api/singer/emergency", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          credentials: "include",
                          body: JSON.stringify({
                            opt_in: true,
                            lead_time: emForm.lead_time === "" ? null : emForm.lead_time,
                            radius: emForm.radius === "" ? null : emForm.radius,
                            modes: emForm.modes,
                            notes: emForm.notes,
                          }),
                        });
                        if (!res.ok) { showAlert("Failed to save settings", "error"); return; }
                        const profileRes = await fetch("/api/auth/me", { credentials: "include" });
                        const profile = await profileRes.json();
                        setCurrentUser({ type: "singer", data: profile });
                        showAlert("Short-notice settings saved", "success");
                      } catch (err) {
                        showAlert("Failed to save settings", "error");
                      }
                      setEmSaving(false);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
                  >
                    {emSaving ? "Saving…" : "Save Emergency Settings"}
                  </button>
                </div>
              </div>
            )}

            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-3 items-end mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                  <input
                    data-testid="input-avail-start"
                    type="date"
                    value={availStart}
                    onChange={(e) => setAvailStart(e.target.value)}
                    className="w-full rounded-md border border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 px-3 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input
                    data-testid="input-avail-end"
                    type="date"
                    value={availEnd}
                    onChange={(e) => setAvailEnd(e.target.value)}
                    className="w-full rounded-md border border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 px-3 text-sm"
                  />
                </div>
                <button
                  data-testid="button-add-availability"
                  onClick={handleAddAvailability}
                  disabled={availSaving}
                  className="inline-flex items-center px-4 h-10 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
                >
                  {availSaving ? "Adding…" : "+ Add Window"}
                </button>
              </div>

              {userAvails.length > 0 ? (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Windows</h4>
                  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <ul className="divide-y divide-slate-200">
                      {userAvails.map((a) => (
                        <li key={a.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50" data-testid={`avail-window-${a.id}`}>
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-900 font-medium">
                              {new Date(a.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                            <span className="text-slate-400">—</span>
                            <span className="text-sm text-slate-900 font-medium">
                              {new Date(a.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                            {a.status && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                {a.status}
                              </span>
                            )}
                          </div>
                          <button
                            data-testid={`button-delete-avail-${a.id}`}
                            onClick={() => handleDeleteAvailability(a.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                            title="Remove this window"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No availability windows yet. Add dates above to appear in search results.</p>
                </div>
              )}
            </div>
          </div>

           {/* Repertoire Entry Section */}
          <div className="bg-white shadow rounded-lg mb-8">
             <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center rounded-t-lg overflow-hidden">
                <div>
                   <h3 className="text-lg leading-6 font-medium text-slate-900">Repertoire & Experience</h3>
                   <p className="mt-1 text-sm text-slate-500">Add roles and works so organizations can find you when they need specific experience.</p>
                </div>
                <div className="flex gap-3">
                   <button 
                      onClick={() => setIsAddingRole(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                   >
                      + Add Opera Role
                   </button>
                   <button 
                      onClick={() => setIsAddingWork(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                   >
                      + Add Concert Work
                   </button>
                </div>
             </div>
             
             {/* Suggest a Work or Role */}
             <div className="px-6 pt-4 pb-2 border-b border-slate-200 bg-white">
                <button
                    type="button"
                    onClick={() => setIsSuggestingRepertoire(v => !v)}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    data-testid="link-suggest-repertoire"
                >
                    Can't find a work or role? Suggest one →
                </button>
                {isSuggestingRepertoire && (
                    <form onSubmit={submitRepertoireSuggestion} className="mt-3 p-4 rounded-md border border-slate-200 bg-slate-50" data-testid="form-suggest-repertoire">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Work Title <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={suggestForm.work_title}
                                    onChange={(e) => setSuggestForm({ ...suggestForm, work_title: e.target.value })}
                                    placeholder="e.g. Some Rare Opera"
                                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-9 border px-3 text-sm"
                                    data-testid="input-suggest-work-title"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Composer</label>
                                <input
                                    type="text"
                                    value={suggestForm.composer}
                                    onChange={(e) => setSuggestForm({ ...suggestForm, composer: e.target.value })}
                                    placeholder="e.g. Composer Name"
                                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-9 border px-3 text-sm"
                                    data-testid="input-suggest-composer"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-slate-700 mb-1">Role Name</label>
                                <input
                                    type="text"
                                    value={suggestForm.role_name}
                                    onChange={(e) => setSuggestForm({ ...suggestForm, role_name: e.target.value })}
                                    placeholder="e.g. Character Name"
                                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-9 border px-3 text-sm"
                                    data-testid="input-suggest-role-name"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
                                <textarea
                                    value={suggestForm.notes}
                                    onChange={(e) => setSuggestForm({ ...suggestForm, notes: e.target.value })}
                                    placeholder="e.g. this is commonly listed as X"
                                    rows={2}
                                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2 text-sm"
                                    data-testid="input-suggest-notes"
                                />
                            </div>
                        </div>
                        {suggestError && <p className="mt-3 text-sm text-red-600" data-testid="text-suggest-error">{suggestError}</p>}
                        <div className="mt-3 flex items-center gap-3">
                            <button
                                type="submit"
                                disabled={suggestSubmitting}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                                data-testid="button-submit-suggestion"
                            >
                                {suggestSubmitting ? "Submitting…" : "Submit suggestion"}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setIsSuggestingRepertoire(false); setSuggestError(""); }}
                                className="text-sm text-slate-500 hover:text-slate-700"
                                data-testid="button-cancel-suggestion"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
                {suggestSuccess && (
                    <p className="mt-3 text-sm text-green-700" data-testid="text-suggest-success">
                        Thanks — we'll review your suggestion.
                    </p>
                )}
             </div>

             {/* Add Opera Role Form */}
             <AnimatePresence>
             {isAddingRole && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-b border-slate-200 bg-blue-50/50"
                >
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                           <h4 className="text-base font-semibold text-slate-900">{editingRoleId ? "Edit Opera Role" : "Add Opera Role"}</h4>
                           <button onClick={() => { setIsAddingRole(false); setEditingRoleId(null); setNewRole({ role_name: "", work_title: "", composer: "", languages: [], other_language: "", performance_types: [], experience_depth: "", last_performed_date: "", notable_companies: "", notes: "", status: "performed" }); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role Name</label>
                                <RepertoireAutocomplete
                                   value={newRole.role_name}
                                   onChange={(v) => setNewRole({...newRole, role_name: v})}
                                   onSelect={(item) => {
                                     setNewRole(prev => ({
                                       ...prev,
                                       role_name: item.part_name,
                                       ...(item.work_title ? { work_title: item.work_title } : {}),
                                       ...(item.composer ? { composer: item.composer } : {}),
                                     }));
                                   }}
                                   placeholder="e.g. Leporello, Violetta"
                                   inputClassName="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 border pl-10 pr-3"
                                   testId="input-singer-role-name"
                                   searchType="role"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Opera Title</label>
                                <RepertoireAutocomplete
                                   value={newRole.work_title}
                                   onChange={(v) => setNewRole({...newRole, work_title: v})}
                                   onSelect={(item) => {
                                     setNewRole(prev => ({
                                       ...prev,
                                       work_title: item.work_title,
                                       ...(item.composer ? { composer: item.composer } : {}),
                                     }));
                                   }}
                                   placeholder="e.g. Don Giovanni, Carmina Burana"
                                   inputClassName="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 border pl-10 pr-3"
                                   testId="input-singer-opera-title"
                                   searchType="work"
                                   iconClassName="absolute left-3 top-2.5 h-4 w-4 text-slate-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Composer</label>
                                <input 
                                   type="text" 
                                   placeholder="e.g. Mozart"
                                   className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 border px-3"
                                   value={newRole.composer}
                                   onChange={(e) => setNewRole({...newRole, composer: e.target.value})}
                                />
                            </div>
                            {/* Voice Type REMOVED - inherited from profile */}
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Performance Type(s)</label>
                            <div className="flex gap-4">
                                {['fully_staged', 'concert', 'cover'].map(type => (
                                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={newRole.performance_types.includes(type)}
                                            onChange={() => togglePerfType(type)}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-slate-700 capitalize">{type.replace('_', ' ')}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                            <div className="flex gap-4">
                                {[{v:'performed',l:'Performed'},{v:'in_preparation',l:'In Preparation'}].map(opt => (
                                    <label key={opt.v} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="role-status"
                                            value={opt.v}
                                            checked={(newRole.status || 'performed') === opt.v}
                                            onChange={() => setNewRole({...newRole, status: opt.v})}
                                            className="border-slate-300 text-blue-600 focus:ring-blue-500"
                                            data-testid={`radio-role-status-${opt.v}`}
                                        />
                                        <span className="text-sm text-slate-700">{opt.l}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Language(s) Performed</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {['Italian', 'German', 'French', 'English', 'Spanish', 'Other'].map(lang => (
                                    <button
                                        key={lang}
                                        onClick={() => toggleLanguage(lang, true)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                            newRole.languages.includes(lang) 
                                            ? 'bg-blue-100 text-blue-800 border-blue-200' 
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        {lang}
                                    </button>
                                ))}
                            </div>
                            {newRole.languages.includes("Other") && (
                                <input 
                                    type="text" 
                                    placeholder="Specify other language..." 
                                    className="mt-2 w-full md:w-1/2 rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-9 border px-3 text-sm"
                                    value={newRole.other_language}
                                    onChange={(e) => setNewRole({...newRole, other_language: e.target.value})}
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Experience Depth</label>
                                <select 
                                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 border px-3"
                                    value={newRole.experience_depth}
                                    onChange={(e) => setNewRole({...newRole, experience_depth: e.target.value})}
                                >
                                    <option value="">Select times performed...</option>
                                    <option value="1-2">1-2 times</option>
                                    <option value="3-5">3-5 times</option>
                                    <option value="6-10">6-10 times</option>
                                    <option value="10+">10+ times</option>
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Last Performed</label>
                                <input 
                                   type="month" 
                                   className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 border px-3"
                                   value={newRole.last_performed_date}
                                   onChange={(e) => setNewRole({...newRole, last_performed_date: e.target.value})}
                                />
                            </div>
                        </div>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Notable Companies (comma separated)</label>
                            <input 
                               type="text" 
                               placeholder="e.g. Metropolitan Opera, Lyric Opera of Chicago"
                               className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 border px-3"
                               value={newRole.notable_companies}
                               onChange={(e) => setNewRole({...newRole, notable_companies: e.target.value})}
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => { setIsAddingRole(false); setEditingRoleId(null); setNewRole({ role_name: "", work_title: "", composer: "", languages: [], other_language: "", performance_types: [], experience_depth: "", last_performed_date: "", notable_companies: "", notes: "", status: "performed" }); }}
                                className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={editingRoleId ? handleUpdateRole : handleSaveRole}
                                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                                {editingRoleId ? "Update Role" : "Save Role"}
                            </button>
                        </div>
                    </div>
                </motion.div>
             )}
             </AnimatePresence>

             {/* Add Concert Work Form */}
             <AnimatePresence>
             {isAddingWork && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-b border-slate-200 bg-indigo-50/50"
                >
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                           <h4 className="text-base font-semibold text-slate-900">{editingWorkId ? 'Edit Concert Work' : 'Add Concert Work'}</h4>
                           <button onClick={() => { setIsAddingWork(false); setEditingWorkId(null); setNewWork({ work_title: "", composer: "", part_name: "", context: "Orchestra", other_context: "", languages: [], other_language: "", experience_depth: "", last_performed_date: "", notable_ensembles: "", notes: "", status: "performed" }); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Work Title</label>
                                <RepertoireAutocomplete
                                   searchType="work"
                                   categories={["oratorio", "symphonic"]}
                                   value={newWork.work_title}
                                   onChange={(v) => setNewWork({...newWork, work_title: v})}
                                   onSelect={(item) => setNewWork(prev => ({
                                     ...prev,
                                     work_title: item.work_title,
                                     composer: item.composer || prev.composer,
                                   }))}
                                   placeholder="e.g. Symphony No. 9"
                                   showIcon={false}
                                   inputClassName="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 border px-3"
                                   testId="input-work-title-autocomplete"
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Composer</label>
                                <input 
                                   type="text" 
                                   placeholder="e.g. Beethoven"
                                   className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 border px-3"
                                   value={newWork.composer}
                                   onChange={(e) => setNewWork({...newWork, composer: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Part / Role Name</label>
                                <input 
                                   type="text" 
                                   placeholder="e.g. Soprano Solo (if applicable)"
                                   className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 border px-3"
                                   value={newWork.part_name}
                                   onChange={(e) => setNewWork({...newWork, part_name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Context</label>
                                <select 
                                   className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 border px-3 bg-white"
                                   value={newWork.context}
                                   onChange={(e) => setNewWork({...newWork, context: e.target.value})}
                                >
                                   <option value="Orchestra">Orchestra</option>
                                   <option value="Oratorio">Oratorio</option>
                                   <option value="Symphonic Chorus">Symphonic Chorus</option>
                                   <option value="Recital">Recital</option>
                                   <option value="Church">Church</option>
                                   <option value="Other">Other</option>
                                </select>
                                {newWork.context === "Other" && (
                                   <input 
                                      type="text" 
                                      placeholder="Specify context..." 
                                      className="mt-2 w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-9 border px-3 text-sm"
                                      value={newWork.other_context}
                                      onChange={(e) => setNewWork({...newWork, other_context: e.target.value})}
                                   />
                                )}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                            <div className="flex gap-4">
                                {[{v:'performed',l:'Performed'},{v:'in_preparation',l:'In Preparation'}].map(opt => (
                                    <label key={opt.v} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="work-status"
                                            value={opt.v}
                                            checked={(newWork.status || 'performed') === opt.v}
                                            onChange={() => setNewWork({...newWork, status: opt.v})}
                                            className="border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                            data-testid={`radio-work-status-${opt.v}`}
                                        />
                                        <span className="text-sm text-slate-700">{opt.l}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Language(s)</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {['Latin', 'German', 'English', 'French', 'Italian', 'Other'].map(lang => (
                                    <button
                                        key={lang}
                                        onClick={() => toggleLanguage(lang, false)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                            newWork.languages.includes(lang) 
                                            ? 'bg-blue-100 text-blue-800 border-blue-200' 
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        {lang}
                                    </button>
                                ))}
                            </div>
                             {newWork.languages.includes("Other") && (
                                <input 
                                    type="text" 
                                    placeholder="Specify other language..." 
                                    className="mt-2 w-full md:w-1/2 rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-9 border px-3 text-sm"
                                    value={newWork.other_language}
                                    onChange={(e) => setNewWork({...newWork, other_language: e.target.value})}
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Experience Depth</label>
                                <select 
                                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 border px-3"
                                    value={newWork.experience_depth}
                                    onChange={(e) => setNewWork({...newWork, experience_depth: e.target.value})}
                                >
                                    <option value="">Select times performed...</option>
                                    <option value="1-2">1-2 times</option>
                                    <option value="3-5">3-5 times</option>
                                    <option value="6-10">6-10 times</option>
                                    <option value="10+">10+ times</option>
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Last Performed</label>
                                <input 
                                   type="month" 
                                   className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 border px-3"
                                   value={newWork.last_performed_date}
                                   onChange={(e) => setNewWork({...newWork, last_performed_date: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Notable Ensembles (comma separated)</label>
                            <input 
                               type="text" 
                               placeholder="e.g. Boston Symphony, Cleveland Orchestra"
                               className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-10 border px-3"
                               value={newWork.notable_ensembles}
                               onChange={(e) => setNewWork({...newWork, notable_ensembles: e.target.value})}
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => { setIsAddingWork(false); setEditingWorkId(null); setNewWork({ work_title: "", composer: "", part_name: "", context: "Orchestra", other_context: "", languages: [], other_language: "", experience_depth: "", last_performed_date: "", notable_ensembles: "", notes: "", status: "performed" }); }}
                                className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={editingWorkId !== null ? handleUpdateWork : handleSaveWork}
                                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                                {editingWorkId !== null ? 'Update Work' : 'Save Work'}
                            </button>
                        </div>
                    </div>
                </motion.div>
             )}
             </AnimatePresence>

             {/* Repertoire List Display */}
             <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                     <h4 className="text-sm font-semibold text-slate-900">Your Repertoire</h4>
                </div>
                
                <div className="text-sm text-slate-500 mb-6 bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-2 items-start">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0"/>
                    <div>
                        <p className="font-medium text-blue-900">Resume parsing coming soon.</p>
                        <p className="text-blue-800/80">For now, please add your most performed roles manually to ensure you appear in specific role searches.</p>
                    </div>
                </div>
                {((user.roles?.length ?? 0) + (user.works?.length ?? 0)) === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                            <Users className="w-6 h-6 text-slate-300" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mb-1">No repertoire added yet</h3>
                        <p className="text-slate-500 text-sm mb-4 max-w-xs mx-auto">Organizations search by specific roles and works. Add your data to be found.</p>
                        <button 
                            onClick={() => setIsAddingRole(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            + Add First Role
                        </button>
                    </div>
                ) : (() => {
                    const performedRoles = (user.roles || []).filter(r => (r.status || 'performed') === 'performed');
                    const inPrepRoles = (user.roles || []).filter(r => r.status === 'in_preparation');
                    const performedWorks = (user.works || []).filter(w => (w.status || 'performed') === 'performed');
                    const inPrepWorks = (user.works || []).filter(w => w.status === 'in_preparation');

                    const moveItem = async (kind, id, nextStatus) => {
                        try {
                            const url = kind === 'role' ? `/api/singer/roles/${id}` : `/api/singer/works/${id}`;
                            const res = await fetch(url, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify({ status: nextStatus }),
                            });
                            if (!res.ok) {
                                const err = await res.json().catch(() => ({}));
                                showAlert(err.message || 'Failed to update status', 'error');
                                return;
                            }
                            const profileRes = await fetch('/api/auth/me', { credentials: 'include' });
                            const profile = await profileRes.json();
                            setCurrentUser({ type: 'singer', data: profile });
                            showAlert(nextStatus === 'in_preparation' ? 'Moved to In Preparation' : 'Moved to Performed', 'success');
                        } catch (e) {
                            showAlert('Failed to update status', 'error');
                        }
                    };

                    const renderRole = (role, opts = {}) => (
                        <li key={role.id} className={`px-4 py-3 hover:bg-slate-50 ${opts.muted ? 'opacity-80' : ''}`} data-testid={`role-item-${role.id}`}>
                            <div className="flex justify-between items-center">
                                <div className={opts.muted ? 'text-sm' : ''}>
                                    <span className={`font-medium ${opts.muted ? 'text-slate-700' : 'text-slate-900'}`}>{role.role_name}</span>
                                    <span className="text-slate-500 mx-1">in</span>
                                    <span className="text-slate-600 italic">{role.work_title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500">{role.composer}</span>
                                    {!opts.muted && (role.performance_types || []).map(t => (
                                        <span key={t} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs capitalize">
                                            {t.replace('_', ' ')}
                                        </span>
                                    ))}
                                    <button
                                        data-testid={`button-move-role-${role.id}`}
                                        onClick={() => moveItem('role', role.id, opts.muted ? 'performed' : 'in_preparation')}
                                        className="text-xs text-slate-500 hover:text-blue-600 underline-offset-2 hover:underline ml-1"
                                        title={opts.muted ? 'Move to Performed' : 'Move to In Preparation'}
                                    >
                                        {opts.muted ? '→ Performed' : '→ In Prep'}
                                    </button>
                                    <button
                                        data-testid={`button-edit-role-${role.id}`}
                                        onClick={() => handleEditRole(role)}
                                        className="text-slate-400 hover:text-blue-500 transition-colors ml-1"
                                        title="Edit role"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        data-testid={`button-delete-role-${role.id}`}
                                        onClick={() => handleDeleteRole(role.id)}
                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                        title="Delete role"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </li>
                    );

                    const renderWork = (work, opts = {}) => (
                        <li key={work.id} className={`px-4 py-3 hover:bg-slate-50 ${opts.muted ? 'opacity-80' : ''}`} data-testid={`work-item-${work.id}`}>
                            <div className="flex justify-between items-center">
                                <div className={opts.muted ? 'text-sm' : ''}>
                                    <span className={`font-medium ${opts.muted ? 'text-slate-700' : 'text-slate-900'}`}>{work.work_title}</span>
                                    {work.part_name && <>
                                        <span className="text-slate-500 mx-2">•</span>
                                        <span className="text-slate-600">{work.part_name}</span>
                                    </>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500">{work.composer}</span>
                                    {!opts.muted && (
                                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs capitalize">
                                            {work.context}
                                        </span>
                                    )}
                                    <button
                                        data-testid={`button-move-work-${work.id}`}
                                        onClick={() => moveItem('work', work.id, opts.muted ? 'performed' : 'in_preparation')}
                                        className="text-xs text-slate-500 hover:text-indigo-600 underline-offset-2 hover:underline ml-1"
                                        title={opts.muted ? 'Move to Performed' : 'Move to In Preparation'}
                                    >
                                        {opts.muted ? '→ Performed' : '→ In Prep'}
                                    </button>
                                    <button
                                        data-testid={`button-edit-work-${work.id}`}
                                        onClick={() => handleEditWork(work)}
                                        className="text-slate-400 hover:text-blue-500 transition-colors ml-1"
                                        title="Edit work"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        data-testid={`button-delete-work-${work.id}`}
                                        onClick={() => handleDeleteWork(work.id)}
                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                        title="Delete work"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </li>
                    );

                    return (
                        <div className="space-y-6">
                            {(performedRoles.length > 0 || performedWorks.length > 0) && (
                                <div>
                                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3" data-testid="heading-performed-repertoire">Performed Repertoire</h4>
                                    <div className="space-y-4">
                                        {performedRoles.length > 0 && (
                                            <div>
                                                <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Opera Roles</h5>
                                                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                                                    <ul className="divide-y divide-slate-200">{performedRoles.map(r => renderRole(r))}</ul>
                                                </div>
                                            </div>
                                        )}
                                        {performedWorks.length > 0 && (
                                            <div>
                                                <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Concert Works</h5>
                                                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                                                    <ul className="divide-y divide-slate-200">{performedWorks.map(w => renderWork(w))}</ul>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {(inPrepRoles.length > 0 || inPrepWorks.length > 0) && (
                                <div>
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2" data-testid="heading-in-preparation-repertoire">
                                        Roles & Works in Preparation
                                        <span className="px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-medium border border-amber-100">In Prep</span>
                                    </h4>
                                    <div className="bg-slate-50/60 border border-dashed border-slate-200 rounded-lg overflow-hidden">
                                        <ul className="divide-y divide-slate-200">
                                            {inPrepRoles.map(r => renderRole(r, { muted: true }))}
                                            {inPrepWorks.map(w => renderWork(w, { muted: true }))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })()}
             </div>
          </div>

        </div>
      </div>
    );
  };
