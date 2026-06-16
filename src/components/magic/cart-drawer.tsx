"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { X, Plus, Minus, ShoppingBag, Sparkles } from "lucide-react";
import { useCart } from "@/stores/cart";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/money";
import {
  FREE_SHIPPING_THRESHOLD_MINOR,
  FLAT_SHIPPING_MINOR,
} from "@/server/services/pricing";

export function CartDrawer() {
  const { items, isOpen, close, setQty, remove } = useCart();
  const subtotal = useCart((s) => s.subtotalMinor());
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD_MINOR - subtotal);
  const freePct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD_MINOR) * 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            className="glass fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            role="dialog"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <ShoppingBag className="h-5 w-5 text-[var(--accent)]" /> Your Cart
              </h2>
              <button onClick={close} aria-label="Close cart" className="text-muted hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-[var(--surface-2)]">
                  <ShoppingBag className="h-7 w-7 text-muted" />
                </div>
                <p className="text-muted">Your cart is empty.</p>
                <Link href="/catalog" onClick={close}>
                  <Button variant="secondary">Browse products</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                  {/* free-shipping progress */}
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                    <p className="mb-2 flex items-center gap-1.5 text-xs text-muted">
                      <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
                      {remainingForFree === 0
                        ? "You've unlocked free shipping!"
                        : `Add ${formatMoney(remainingForFree)} for free shipping`}
                    </p>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] transition-all"
                        style={{ width: `${freePct}%` }}
                      />
                    </div>
                  </div>

                  {items.map((item) => (
                    <div key={item.variantId} className="flex gap-3">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-2)]">
                        {item.imageUrl && (
                          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="80px" />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <Link
                          href={`/product/${item.productSlug}`}
                          onClick={close}
                          className="text-sm font-medium leading-tight hover:text-[var(--accent)]"
                        >
                          {item.name}
                        </Link>
                        <span className="mt-1 text-sm text-muted">
                          {formatMoney(item.unitPriceMinor)}
                        </span>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-2 rounded-full border border-[var(--border)] px-1">
                            <button
                              aria-label="Decrease quantity"
                              onClick={() => setQty(item.variantId, item.quantity - 1)}
                              className="grid h-7 w-7 place-items-center text-muted hover:text-foreground"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-5 text-center text-sm">{item.quantity}</span>
                            <button
                              aria-label="Increase quantity"
                              onClick={() => setQty(item.variantId, item.quantity + 1)}
                              className="grid h-7 w-7 place-items-center text-muted hover:text-foreground"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <button
                            onClick={() => remove(item.variantId)}
                            className="text-xs text-muted hover:text-[var(--danger)]"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[var(--border)] px-6 py-5">
                  <div className="mb-1 flex justify-between text-sm text-muted">
                    <span>Subtotal</span>
                    <span className="text-foreground">{formatMoney(subtotal)}</span>
                  </div>
                  <div className="mb-4 flex justify-between text-xs text-muted">
                    <span>Shipping</span>
                    <span>{remainingForFree === 0 ? "Free" : formatMoney(FLAT_SHIPPING_MINOR)}</span>
                  </div>
                  <Link href="/checkout" onClick={close}>
                    <Button className="w-full" size="lg">
                      Checkout · {formatMoney(subtotal)}
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
