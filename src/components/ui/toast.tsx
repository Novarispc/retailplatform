"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useUiStore } from "@/stores/ui";

export function Toasts() {
  const toasts = useUiStore((s) => s.toasts);
  const remove = useUiStore((s) => s.removeToast);

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed right-6 top-6 z-50 flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`max-w-sm rounded-lg px-4 py-2 shadow-lg ring-1 ring-inset ${
            t.type === "success" ? "bg-[var(--success)]/95 text-white" : t.type === "error" ? "bg-[var(--danger)]/95 text-white" : "bg-[var(--surface)] text-foreground"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="text-sm leading-snug">{t.message}</div>
            <button onClick={() => remove(t.id)} className="opacity-80 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Toasts;
