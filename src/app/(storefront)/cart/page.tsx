"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "@/stores/cart";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/money";
import { computeTotals } from "@/server/services/pricing";

export default function CartPage() {
  const { items, setQty, remove } = useCart();
  const totals = computeTotals(
    items.map((i) => ({
      variantId: i.variantId,
      name: i.name,
      unitPriceMinor: i.unitPriceMinor,
      quantity: i.quantity,
    })),
  );

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-5 px-6 py-24 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-[var(--surface-2)]">
          <ShoppingBag className="h-8 w-8 text-muted" />
        </div>
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <p className="text-muted">Discover premium tech curated by AI.</p>
        <Link href="/catalog">
          <Button size="lg">Start shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Shopping cart</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.variantId} className="glass flex gap-4 rounded-[var(--radius)] p-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-2)]">
                {item.imageUrl && <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="96px" />}
              </div>
              <div className="flex flex-1 flex-col">
                <Link href={`/product/${item.productSlug}`} className="font-medium hover:text-[var(--accent)]">
                  {item.name}
                </Link>
                <span className="text-sm text-muted">{formatMoney(item.unitPriceMinor)}</span>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-2 rounded-full border border-[var(--border)] px-1">
                    <button onClick={() => setQty(item.variantId, item.quantity - 1)} aria-label="Decrease" className="grid h-8 w-8 place-items-center text-muted hover:text-foreground">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => setQty(item.variantId, item.quantity + 1)} aria-label="Increase" className="grid h-8 w-8 place-items-center text-muted hover:text-foreground">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button onClick={() => remove(item.variantId)} aria-label="Remove item" className="text-muted hover:text-[var(--danger)]">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="font-semibold">{formatMoney(item.unitPriceMinor * item.quantity)}</div>
            </div>
          ))}
        </div>

        <aside className="glass h-fit rounded-[var(--radius)] p-6">
          <h2 className="mb-4 text-lg font-semibold">Order summary</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatMoney(totals.subtotalMinor)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">GST (18%)</dt><dd>{formatMoney(totals.taxMinor)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{totals.shippingMinor === 0 ? "Free" : formatMoney(totals.shippingMinor)}</dd></div>
            <div className="my-3 h-px bg-[var(--border)]" />
            <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd className="gradient-text">{formatMoney(totals.totalMinor)}</dd></div>
          </dl>
          <Link href="/checkout">
            <Button size="lg" className="mt-6 w-full">Proceed to checkout</Button>
          </Link>
        </aside>
      </div>
    </div>
  );
}
