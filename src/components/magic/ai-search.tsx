"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";

// Natural-language search: Claude maps the query to catalog filters, then we navigate.
export function AiSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/v1/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      if (!res.ok) throw new Error();
      const f = await res.json();
      const params = new URLSearchParams();
      if (f.keywords) params.set("q", f.keywords);
      if (f.category) params.set("category", f.category);
      if (f.sort) params.set("sort", f.sort);
      router.push(`/catalog?${params.toString()}`);
    } catch {
      // Fall back to a plain keyword search.
      router.push(`/catalog?q=${encodeURIComponent(q)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={run} className="mb-4">
      <div className="gradient-border glow-accent flex items-center gap-2 rounded-full p-1.5 pl-4">
        <Sparkles className="h-4 w-4 shrink-0 text-[var(--accent)]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask in plain English — e.g. “cheap noise-cancelling headphones”"
          className="h-9 flex-1 bg-transparent text-sm focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="grid h-9 shrink-0 place-items-center gap-1 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-4 text-sm font-semibold text-[#06070d] disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "AI Search"}
        </button>
      </div>
    </form>
  );
}
