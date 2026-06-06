import React, { useState, useEffect, useRef } from "react";
import { Search, Music, BookOpen } from "lucide-react";

export const VOICE_TYPE_DB_TO_LABEL = {
  soprano: "Soprano",
  mezzo_soprano: "Mezzo-Soprano",
  contralto: "Contralto",
  countertenor: "Countertenor",
  tenor: "Tenor",
  baritone: "Baritone",
  bass: "Bass",
};

export const CATEGORY_DB_TO_PERFTYPE = {
  opera: "Opera",
  oratorio: "Orchestra",
  symphonic: "Orchestra",
};

function RepertoireAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "e.g. Don Giovanni",
  inputClassName = "",
  iconClassName = "absolute left-3 top-3 h-5 w-5 text-slate-400",
  showIcon = true,
  testId,
  searchType,
  categories,
  filterByWork,
}) {
  const categoriesKey = Array.isArray(categories) ? categories.join(",") : "";
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const lastSelectedRef = useRef(null);
  const hasFocusRef = useRef(false);

  useEffect(() => {
    if (lastSelectedRef.current && value !== lastSelectedRef.current) {
      lastSelectedRef.current = null;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = (value || "").trim();
    if (q.length < 2 || lastSelectedRef.current === value) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const typeParam = searchType ? `&type=${searchType}` : "";
        const catParam = categoriesKey ? `&categories=${encodeURIComponent(categoriesKey)}` : "";
        const workParam = filterByWork ? `&workTitle=${encodeURIComponent(filterByWork)}` : "";
        const res = await fetch(
          `/api/repertoire/search?q=${encodeURIComponent(q)}${typeParam}${catParam}${workParam}`,
          { credentials: "include" }
        );
        if (!res.ok) { setSuggestions([]); return; }
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data : []);
        if (hasFocusRef.current) {
          setOpen(true);
        }
        setActiveIdx(-1);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [value, searchType, categoriesKey, filterByWork]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePick = (item) => {
    const displayValue = searchType === "work" ? item.work_title : item.part_name;
    lastSelectedRef.current = displayValue;
    setOpen(false);
    setSuggestions([]);
    onChange(displayValue);
    onSelect && onSelect(item);
  };

  const handleKeyDown = (e) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      handlePick(suggestions[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const renderItem = (item, idx) => {
    const isWork = searchType === "work";
    const isRole = searchType === "role";

    const label = isWork
      ? item.work_title
      : isRole
        ? item.part_name
        : item.part_name;

    const sub = isWork
      ? item.composer || "Unknown composer"
      : `${item.work_title}${item.composer ? ` (${item.composer})` : ""}`;

    const Icon = isWork ? BookOpen : Music;
    const iconColor = isWork ? "text-blue-500" : "text-purple-500";

    return (
      <button
        type="button"
        key={item.id + (isWork ? "-w" : "-r")}
        onMouseDown={(e) => { e.preventDefault(); handlePick(item); }}
        onMouseEnter={() => setActiveIdx(idx)}
        className={`w-full text-left px-3 py-2 flex items-start gap-2 border-b border-slate-50 last:border-b-0 ${
          activeIdx === idx ? "bg-blue-50" : "hover:bg-slate-50"
        }`}
        data-testid={`autocomplete-item-${isWork ? "work" : "role"}-${item.id}`}
      >
        <Icon className={`w-4 h-4 ${iconColor} flex-shrink-0 mt-0.5`} />
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-900 truncate">{label}</div>
          <div className="text-xs text-slate-500 truncate">{sub}</div>
        </div>
      </button>
    );
  };

  const renderCombined = () => {
    const q = (value || "").trim().toLowerCase();
    const works = [];
    const roles = [];
    const seenWorks = new Set();
    for (const s of suggestions) {
      const titleMatch = q && s.work_title.toLowerCase().includes(q);
      if (titleMatch) {
        const key = `${s.work_title}|${s.composer || ""}`;
        if (!seenWorks.has(key)) { seenWorks.add(key); works.push(s); }
      } else {
        roles.push(s);
      }
    }
    const allItems = [...works, ...roles];
    let ri = -1;
    return (
      <>
        {works.length > 0 && (
          <>
            <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">Works</div>
            {works.map((s) => { ri++; return renderItem(s, ri); })}
          </>
        )}
        {roles.length > 0 && (
          <>
            <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-t border-slate-100">Roles</div>
            {roles.map((s) => { ri++; return renderItem(s, ri); })}
          </>
        )}
      </>
    );
  };

  return (
    <div ref={wrapperRef} className="relative">
      {showIcon && <Search className={iconClassName} />}
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        className={inputClassName}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          hasFocusRef.current = true;
          if (suggestions.length > 0 && (value || "").trim().length >= 2) setOpen(true);
        }}
        onBlur={() => {
          hasFocusRef.current = false;
          setTimeout(() => setOpen(false), 150);
        }}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        data-testid={testId}
      />
      {open && suggestions.length > 0 && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {searchType
            ? suggestions.map((s, i) => renderItem(s, i))
            : renderCombined()
          }
          {loading && (
            <div className="px-3 py-2 text-xs text-slate-400 italic border-t border-slate-100">Searching...</div>
          )}
        </div>
      )}
    </div>
  );
}

export default RepertoireAutocomplete;
