import { Loader2 } from "lucide-react";

export function BusyIcon({ busy, children }) {
  return busy ? <Loader2 className="w-4 h-4 animate-spin" /> : children;
}
