"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  productSlug: string;
  name: string;
  imageUrl: string | null;
  priceMinor: number;
}

interface WishlistState {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  has: (slug: string) => boolean;
  remove: (slug: string) => void;
  clear: () => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) =>
        set((s) =>
          s.items.some((i) => i.productSlug === item.productSlug)
            ? { items: s.items.filter((i) => i.productSlug !== item.productSlug) }
            : { items: [...s.items, item] },
        ),
      has: (slug) => get().items.some((i) => i.productSlug === slug),
      remove: (slug) => set((s) => ({ items: s.items.filter((i) => i.productSlug !== slug) })),
      clear: () => set({ items: [] }),
    }),
    { name: "nova-wishlist" },
  ),
);
