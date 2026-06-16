"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImportResult {
  created: number;
  updated: number;
  errors: { row: number; error: string }[];
}

export function ProductImport() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setResult(null);
    setErr(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/v1/admin/products/import", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok && res.status !== 207) throw new Error(data.error ?? "Import failed");
      setResult(data as ImportResult);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Import failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      <Button
        variant="outline"
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        Import CSV
      </Button>

      {result && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-[var(--success)]">
            <CheckCircle className="h-3.5 w-3.5" />
            {result.created} created · {result.updated} updated
          </div>
          {result.errors.length > 0 && (
            <ul className="mt-2 space-y-1 text-[var(--danger)]">
              {result.errors.slice(0, 5).map((e) => (
                <li key={e.row} className="flex items-start gap-1">
                  <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                  Row {e.row}: {e.error}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {err && <p className="text-xs text-[var(--danger)]">{err}</p>}
    </div>
  );
}
