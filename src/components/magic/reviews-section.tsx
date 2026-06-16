"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { ReviewForm } from "./review-form";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  user: { name: string | null };
}

interface Props {
  productId: string;
  initialReviews: Review[];
  canReview: boolean; // true = logged-in and hasn't reviewed yet
}

export function ReviewsSection({ productId, initialReviews, canReview }: Props) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);

  function onSubmitted(review: Review) {
    setReviews((prev) => [review, ...prev]);
    setShowForm(false);
  }

  return (
    <section className="mt-16">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Customer reviews</h2>
        {canReview && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-full border border-[var(--border)] px-4 py-2 text-sm text-muted transition-colors hover:border-[var(--accent)] hover:text-foreground"
          >
            Write a review
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-8">
          <ReviewForm productId={productId} onSubmitted={onSubmitted} />
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="text-muted">No reviews yet. Be the first!</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {reviews.map((r) => (
            <div key={r.id} className="glass rounded-[var(--radius)] p-5">
              <div className="mb-2 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < r.rating ? "fill-[var(--accent)] text-[var(--accent)]" : "text-[var(--border)]"}`}
                  />
                ))}
              </div>
              {r.title && <p className="font-medium">{r.title}</p>}
              {r.body && <p className="mt-1 text-sm text-muted">{r.body}</p>}
              <p className="mt-3 text-xs text-muted">{r.user.name ?? "Verified buyer"}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
