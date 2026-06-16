"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RecentItem {
  productSlug: string;
  name: string;
  imageUrl: string | null;
  priceMinor: number;
  category: string | null;
}

const MAX = 8;

interface RecentlyViewedState {
  items: RecentItem[];
  track: (item: RecentItem) => void;
  clear: () => void;
}

export const useRecentlyViewed = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      items: [],
      track: (item) =>
        set((s) => {
          const filtered = s.items.filter((i) => i.productSlug !== item.productSlug);
          return { items: [item, ...filtered].slice(0, MAX) };
        }),
      clear: () => set({ items: [] }),
    }),
    { name: "nova-recent" },
  ),
);
