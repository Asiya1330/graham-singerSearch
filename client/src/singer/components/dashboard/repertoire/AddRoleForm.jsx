import React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RepertoireAutocomplete from "../../../../RepertoireAutocomplete";

export function AddRoleForm({ isAddingRole, editingRoleId, newRole, setNewRole, toggleLanguage, togglePerfType, onClose, onSave }) {
  return (
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
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
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
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                {editingRoleId ? "Update Role" : "Save Role"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
