import React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RepertoireAutocomplete from "../../../../RepertoireAutocomplete";

export function AddWorkForm({ isAddingWork, editingWorkId, newWork, setNewWork, toggleLanguage, onClose, onSave }) {
  return (
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
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
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
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                {editingWorkId !== null ? 'Update Work' : 'Save Work'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
