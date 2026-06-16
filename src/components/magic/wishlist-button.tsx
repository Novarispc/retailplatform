"use client";

import { Heart } from "lucide-react";
import { useWishlist, type WishlistItem } from "@/stores/wishlist";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";

interface Props {
  item: WishlistItem;
  className?: string;
}

export function WishlistButton({ item, className }: Props) {
  const toggle = useWishlist((s) => s.toggle);
  const has = useWishlist((s) => s.has);
  const mounted = useMounted();
  const active = mounted && has(item.productSlug);

  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); toggle(item); }}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full border transition-colors",
        active
          ? "border-[var(--danger)]/40 bg-[var(--danger)]/10 text-[var(--danger)]"
          : "border-[var(--border)] text-muted hover:border-[var(--danger)]/40 hover:text-[var(--danger)]",
        className,
      )}
    >
      <Heart className={cn("h-4 w-4", active && "fill-current")} />
    </button>
  );
}
