"use client";

import { useState } from "react";
import { Star, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

interface Props {
  productId: string;
  onSubmitted: (review: { id: string; rating: number; title: string | null; body: string | null; user: { name: string | null } }) => void;
}

export function ReviewForm({ productId, onSubmitted }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setErr("Pick a star rating."); return; }
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/v1/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, title, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit review");
      setDone(true);
      onSubmitted(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-[var(--radius)] border border-[var(--success)]/30 bg-[var(--success)]/10 p-4 text-sm text-[var(--success)]">
        <CheckCircle className="h-4 w-4 shrink-0" />
        Review submitted — thanks!
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass space-y-4 rounded-[var(--radius)] p-6">
      <h3 className="font-semibold">Write a review</h3>

      {/* Star picker */}
      <div>
        <Label>Rating</Label>
        <div className="mt-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setRating(s)}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              aria-label={`${s} star`}
            >
              <Star
                className={`h-7 w-7 transition-colors ${
                  s <= (hover || rating)
                    ? "fill-[var(--accent)] text-[var(--accent)]"
                    : "text-[var(--border)]"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="review-title">Title (optional)</Label>
        <Input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarise your experience"
          maxLength={120}
        />
      </div>

      <div>
        <Label htmlFor="review-body">Review (optional)</Label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What did you think?"
          maxLength={2000}
          rows={4}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none"
        />
      </div>

      {err && <p className="text-sm text-[var(--danger)]">{err}</p>}

      <Button type="submit" disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit review"}
      </Button>
    </form>
  );
}
