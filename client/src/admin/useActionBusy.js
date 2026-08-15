import { useRef, useState } from "react";

export function useActionBusy() {
  const [actionBusy, setActionBusy] = useState(null);
  const actionBusyRef = useRef(null);

  const withBusy = async (key, fn) => {
    if (actionBusyRef.current) return;
    actionBusyRef.current = key;
    setActionBusy(key);
    try {
      await fn();
    } finally {
      actionBusyRef.current = null;
      setActionBusy(null);
    }
  };

  const isBusy = (key) => actionBusy === key;
  const isRowBusy = (prefix) => typeof actionBusy === "string" && actionBusy.startsWith(prefix);

  return { withBusy, isBusy, isRowBusy };
}
