import React, { useState } from "react";
import { useSingerUser } from "../../../hooks/useSingerUser";
import { SuggestRepertoireForm } from "./SuggestRepertoireForm";
import { AddRoleForm } from "./AddRoleForm";
import { AddWorkForm } from "./AddWorkForm";
import { RepertoireList } from "./RepertoireList";

const BLANK_ROLE = {
  role_name: "",
  work_title: "",
  composer: "",
  languages: [],
  other_language: "",
  performance_types: [],
  experience_depth: "",
  last_performed_date: "",
  notable_companies: "",
  notes: "",
  status: "performed",
};

const BLANK_WORK = {
  work_title: "",
  composer: "",
  part_name: "",
  context: "Orchestra",
  other_context: "",
  languages: [],
  other_language: "",
  experience_depth: "",
  last_performed_date: "",
  notable_ensembles: "",
  notes: "",
  status: "performed",
};

export function RepertoireSection() {
  const { user, showAlert, refreshUser } = useSingerUser();

  const [isAddingRole, setIsAddingRole] = useState(false);
  const [isAddingWork, setIsAddingWork] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editingWorkId, setEditingWorkId] = useState(null);
  const [newRole, setNewRole] = useState(BLANK_ROLE);
  const [newWork, setNewWork] = useState(BLANK_WORK);

  const closeRoleForm = () => {
    setIsAddingRole(false);
    setEditingRoleId(null);
    setNewRole(BLANK_ROLE);
  };

  const closeWorkForm = () => {
    setIsAddingWork(false);
    setEditingWorkId(null);
    setNewWork(BLANK_WORK);
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

  const handleSaveRole = async () => {
    if (!newRole.role_name || !newRole.work_title) {
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
      await refreshUser();
      setIsAddingRole(false);
      setNewRole(BLANK_ROLE);
      showAlert("Opera role added to your profile", "success");
    } catch (err) {
      showAlert("Failed to add role", "error");
    }
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
      await refreshUser();
      setIsAddingRole(false);
      setEditingRoleId(null);
      setNewRole(BLANK_ROLE);
      showAlert("Role updated successfully", "success");
    } catch (err) {
      showAlert("Failed to update role", "error");
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!confirm("Delete this role from your profile?")) return;
    try {
      const res = await fetch(`/api/singer/roles/${roleId}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) { showAlert("Failed to delete role", "error"); return; }
      await refreshUser();
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

  const handleSaveWork = async () => {
    if (!newWork.work_title) {
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
      await refreshUser();
      setIsAddingWork(false);
      setNewWork(BLANK_WORK);
      showAlert("Work added to your profile", "success");
    } catch (err) {
      showAlert("Failed to add work", "error");
    }
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
      await refreshUser();
      setIsAddingWork(false);
      setEditingWorkId(null);
      setNewWork(BLANK_WORK);
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
      await refreshUser();
      showAlert("Work removed", "success");
    } catch (err) {
      showAlert("Failed to delete work", "error");
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
      await refreshUser();
      showAlert(nextStatus === 'in_preparation' ? 'Moved to In Preparation' : 'Moved to Performed', 'success');
    } catch (e) {
      showAlert('Failed to update status', 'error');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg mb-8">
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-t-lg">
        <div>
          <h3 className="text-lg leading-6 font-medium text-slate-900">Repertoire & Experience</h3>
          <p className="mt-1 text-sm text-slate-500">Add roles and works so organizations can find you when they need specific experience.</p>
        </div>
        <div className="flex gap-3 flex-wrap flex-shrink-0">
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

      <SuggestRepertoireForm />

      <AddRoleForm
        isAddingRole={isAddingRole}
        editingRoleId={editingRoleId}
        newRole={newRole}
        setNewRole={setNewRole}
        toggleLanguage={toggleLanguage}
        togglePerfType={togglePerfType}
        onClose={closeRoleForm}
        onSave={editingRoleId ? handleUpdateRole : handleSaveRole}
      />

      <AddWorkForm
        isAddingWork={isAddingWork}
        editingWorkId={editingWorkId}
        newWork={newWork}
        setNewWork={setNewWork}
        toggleLanguage={toggleLanguage}
        onClose={closeWorkForm}
        onSave={editingWorkId !== null ? handleUpdateWork : handleSaveWork}
      />

      <RepertoireList
        roles={user.roles}
        works={user.works}
        moveItem={moveItem}
        onEditRole={handleEditRole}
        onDeleteRole={handleDeleteRole}
        onEditWork={handleEditWork}
        onDeleteWork={handleDeleteWork}
        onAddFirst={() => setIsAddingRole(true)}
      />
    </div>
  );
}
