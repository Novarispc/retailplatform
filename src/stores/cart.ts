"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  variantId: string;
  productSlug: string;
  name: string;
  imageUrl: string | null;
  unitPriceMinor: number;
  quantity: number;
}

interface CartState {
  items: CartLine[];
  isOpen: boolean;
  add: (line: Omit<CartLine, "quantity">, qty?: number) => void;
  remove: (variantId: string) => void;
  setQty: (variantId: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  count: () => number;
  subtotalMinor: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      add: (line, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.variantId === line.variantId);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.variantId === line.variantId
                  ? { ...i, quantity: Math.min(99, i.quantity + qty) }
                  : i,
              ),
              isOpen: true,
            };
          }
          return { items: [...s.items, { ...line, quantity: qty }], isOpen: true };
        }),
      remove: (variantId) =>
        set((s) => ({ items: s.items.filter((i) => i.variantId !== variantId) })),
      setQty: (variantId, qty) =>
        set((s) => ({
          items: s.items
            .map((i) =>
              i.variantId === variantId
                ? { ...i, quantity: Math.max(0, Math.min(99, qty)) }
                : i,
            )
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      count: () => get().items.reduce((n, i) => n + i.quantity, 0),
      subtotalMinor: () =>
        get().items.reduce((n, i) => n + i.unitPriceMinor * i.quantity, 0),
    }),
    { name: "nova-cart", partialize: (s) => ({ items: s.items }) },
  ),
);
