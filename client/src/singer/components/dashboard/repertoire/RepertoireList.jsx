import React from "react";
import { Edit2, Info, Users, X } from "lucide-react";

export function RepertoireList({ roles, works, moveItem, onEditRole, onDeleteRole, onEditWork, onDeleteWork, onAddFirst }) {
  const allRoles = roles || [];
  const allWorks = works || [];

  const renderRole = (role, opts = {}) => (
    <li key={role.id} className={`px-4 py-3 hover:bg-slate-50 ${opts.muted ? 'opacity-80' : ''}`} data-testid={`role-item-${role.id}`}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div className={`min-w-0 break-words ${opts.muted ? 'text-sm' : ''}`}>
          <span className={`font-medium ${opts.muted ? 'text-slate-700' : 'text-slate-900'}`}>{role.role_name}</span>
          <span className="text-slate-500 mx-1">in</span>
          <span className="text-slate-600 italic">{role.work_title}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
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
            onClick={() => onEditRole(role)}
            className="text-slate-400 hover:text-blue-500 transition-colors ml-1"
            title="Edit role"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            data-testid={`button-delete-role-${role.id}`}
            onClick={() => onDeleteRole(role.id)}
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div className={`min-w-0 break-words ${opts.muted ? 'text-sm' : ''}`}>
          <span className={`font-medium ${opts.muted ? 'text-slate-700' : 'text-slate-900'}`}>{work.work_title}</span>
          {work.part_name && <>
            <span className="text-slate-500 mx-2">•</span>
            <span className="text-slate-600">{work.part_name}</span>
          </>}
        </div>
        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
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
            onClick={() => onEditWork(work)}
            className="text-slate-400 hover:text-blue-500 transition-colors ml-1"
            title="Edit work"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            data-testid={`button-delete-work-${work.id}`}
            onClick={() => onDeleteWork(work.id)}
            className="text-slate-400 hover:text-red-500 transition-colors"
            title="Delete work"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </li>
  );

  const performedRoles = allRoles.filter(r => (r.status || 'performed') === 'performed');
  const inPrepRoles = allRoles.filter(r => r.status === 'in_preparation');
  const performedWorks = allWorks.filter(w => (w.status || 'performed') === 'performed');
  const inPrepWorks = allWorks.filter(w => w.status === 'in_preparation');

  return (
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
      {(allRoles.length + allWorks.length) === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
            <Users className="w-6 h-6 text-slate-300" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">No repertoire added yet</h3>
          <p className="text-slate-500 text-sm mb-4 max-w-xs mx-auto">Organizations search by specific roles and works. Add your data to be found.</p>
          <button
            onClick={onAddFirst}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            + Add First Role
          </button>
        </div>
      ) : (
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
      )}
    </div>
  );
}
