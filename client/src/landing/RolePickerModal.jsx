import React from "react";
import { Users, Search, X } from "lucide-react";
import { useAppContext } from "../AppContext";
import { navigateToView } from "../lib/nav";

export function RolePickerModal({ open, onClose }) {
  const { setView } = useAppContext();

  if (!open) return null;

  const pick = (loginView, registerView) => ({
    login: () => { onClose(); navigateToView(setView, loginView); },
    register: () => { onClose(); navigateToView(setView, registerView); },
  });

  const singer = pick("singerLogin", "singerRegister");
  const org = pick("organizationLogin", "orgRegister");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-slate-900 text-center mb-1">Welcome back</h2>
        <p className="text-sm text-slate-500 text-center mb-6">How would you like to continue?</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Singer card */}
          <button
            onClick={singer.login}
            className="group flex flex-col items-center gap-3 p-6 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
            data-testid="role-pick-singer"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-base font-semibold text-slate-900">Singer</span>
            <span className="text-xs text-slate-500 text-center">Sign in to your performer account</span>
          </button>

          {/* Organization card */}
          <button
            onClick={org.login}
            className="group flex flex-col items-center gap-3 p-6 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
            data-testid="role-pick-org"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-base font-semibold text-slate-900">Organization</span>
            <span className="text-xs text-slate-500 text-center">Sign in to find and contact singers</span>
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <button onClick={singer.register} className="font-medium text-blue-600 hover:text-blue-500 bg-transparent border-none cursor-pointer">
            Register as Singer
          </button>
          {" or "}
          <button onClick={org.register} className="font-medium text-blue-600 hover:text-blue-500 bg-transparent border-none cursor-pointer">
            Organization
          </button>
        </div>
      </div>
    </div>
  );
}
