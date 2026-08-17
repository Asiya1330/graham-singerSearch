export function AdminNav({ onLogoClick, rightContent }) {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between gap-3 h-16 items-center">
          <div className="flex items-center min-w-0 cursor-pointer" onClick={onLogoClick}>
            <span className="text-lg sm:text-2xl font-bold text-slate-900 truncate">Singer Search</span>
            <span className="ml-2 shrink-0 text-[10px] sm:text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">ADMIN</span>
          </div>
          <div className="shrink-0">{rightContent}</div>
        </div>
      </div>
    </nav>
  );
}
