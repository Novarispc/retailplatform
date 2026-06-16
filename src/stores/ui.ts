"use client";

import { create } from "zustand";

export type ToastType = "info" | "success" | "error";

export type Toast = {
  id: string;
  message: string;
  type?: ToastType;
};

interface UiState {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, ttl?: number) => string;
  removeToast: (id: string) => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  toasts: [],
  addToast(message: string, type: ToastType = "info", ttl = 2500) {
    const id = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    window.setTimeout(() => get().removeToast(id), ttl);
    return id;
  },
  removeToast(id: string) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));

export default useUiStore;
