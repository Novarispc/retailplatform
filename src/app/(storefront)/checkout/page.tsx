"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Lock, Loader2, QrCode, CreditCard, CheckCircle2, Clock } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useCart } from "@/stores/cart";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { formatMoney, type CurrencyCode } from "@/lib/money";
import { computeTotals } from "@/server/services/pricing";
import { addressSchema } from "@/lib/contracts";
import { useCurrency } from "@/lib/use-currency";
import { fromINRMinor } from "@/lib/fx";

// ── UPI QR Panel ──────────────────────────────────────────────────────────────
function UpiQrPanel({
  providerOrderId,
  amountMinor,
  orderNumber,
  storeName,
  onSuccess,
  onError,
}: {
  providerOrderId: string;
  amountMinor: number;
  orderNumber: string;
  storeName: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [closeBy, setCloseBy] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(900);
  const [loading, setLoading] = useState(true);
  const [paid, setPaid] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function createQr() {
      try {
        const res = await fetch("/api/v1/payments/upi-qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ providerOrderId, amountMinor, orderNumber, storeName }),
        });
        const data = await res.json();
        if (!res.ok || !data.imageUrl) throw new Error(data.error ?? "QR creation failed");
        if (cancelled) return;
        setImageUrl(data.imageUrl);
        setCloseBy(data.closeBy);
        const secs = Math.max(0, data.closeBy - Math.floor(Date.now() / 1000));
        setTimeLeft(secs);
        setLoading(false);

        // Countdown timer.
        timerRef.current = setInterval(() => {
          setTimeLeft((t) => Math.max(0, t - 1));
        }, 1000);

        // Poll payment status every 3s.
        pollRef.current = setInterval(async () => {
          try {
            const r = await fetch(`/api/v1/payments/upi-qr-status?providerOrderId=${encodeURIComponent(providerOrderId)}`);
            const d = await r.json();
            if (d.paid) {
              stopPolling();
              setPaid(true);
              setTimeout(onSuccess, 1200);
            }
          } catch {}
        }, 3000);
      } catch (err) {
        if (!cancelled) onError(err instanceof Error ? err.message : "QR generation failed");
      }
    }
    createQr();
    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [providerOrderId, amountMinor, orderNumber, storeName, onSuccess, onError, stopPolling]);

  // Stop polling when QR expires.
  useEffect(() => {
    if (timeLeft === 0) stopPolling();
  }, [timeLeft, stopPolling]);

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  if (paid) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <CheckCircle2 className="h-12 w-12 text-[var(--success)]" />
        <p className="text-sm font-semibold">Payment received! Redirecting…</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
        <p className="text-xs text-muted">Generating QR code…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-center text-sm text-muted">
        Scan with <span className="font-semibold text-foreground">GPay, PhonePe, Paytm</span> or any UPI app
      </p>
      {imageUrl && (
        <div className="rounded-2xl bg-white p-3 shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="UPI QR code" width={220} height={220} />
        </div>
      )}
      <div className={`flex items-center gap-1.5 text-sm font-mono ${timeLeft < 60 ? "text-[var(--danger)]" : "text-muted"}`}>
        <Clock className="h-4 w-4" />
        {mm}:{ss} remaining
      </div>
      {timeLeft === 0 && (
        <p className="text-xs text-[var(--danger)]">QR expired — go back and retry.</p>
      )}
      <p className="text-center text-[10px] text-muted">
        Do not close this page until payment is confirmed
      </p>
    </div>
  );
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

// ── Stripe Payment Form (rendered inside <Elements>) ──────────────────────────
function StripePayForm({
  orderNumber,
  onSuccess,
  onError,
}: {
  orderNumber: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);

  async function handleStripe(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Stripe will redirect here on 3DS; we handle it via webhook.
        return_url: `${window.location.origin}/order/${orderNumber}`,
      },
      redirect: "if_required",
    });
    setBusy(false);
    if (error) {
      onError(error.message ?? "Payment failed");
    } else {
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleStripe} className="space-y-4">
      <PaymentElement />
      <Button type="submit" size="lg" className="w-full" disabled={busy || !stripe}>
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Lock className="h-4 w-4" /> Pay now</>}
      </Button>
      <p className="text-center text-xs text-muted">Secured by Stripe · 256-bit encryption</p>
    </form>
  );
}

// ── Main checkout page ─────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, clear } = useCart();
  const { currency } = useCurrency();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // INR-only: "card" (Razorpay modal) or "upi_qr"
  type PayMethod = "card" | "upi_qr";
  const [payMethod, setPayMethod] = useState<PayMethod>("card");

  // After order creation, Stripe path keeps these for the <Elements> phase.
  const [stripeData, setStripeData] = useState<{
    clientSecret: string;
    publishableKey: string;
    orderNumber: string;
  } | null>(null);

  // After order creation, UPI QR path keeps these.
  const [upiData, setUpiData] = useState<{
    providerOrderId: string;
    amountMinor: number;
    orderNumber: string;
    storeName: string;
  } | null>(null);
  // Cache the Stripe.js Promise — never recreate on re-render.
  const stripePromise = useMemo(
    () => (stripeData?.publishableKey ? loadStripe(stripeData.publishableKey) : null),
    [stripeData],
  );

  const [form, setForm] = useState({
    email: session?.user?.email ?? "",
    fullName: session?.user?.name ?? "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: currency === "INR" ? "IN" : "SE",
    phone: "",
  });

  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discountMinor: number; freeShipping: boolean } | null>(null);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);

  const lineInputs = items.map((i) => ({ variantId: i.variantId, name: i.name, unitPriceMinor: i.unitPriceMinor, quantity: i.quantity }));
  const displayDiscount = coupon
    ? coupon.freeShipping
      ? ({ type: "FREE_SHIPPING", value: 0 } as const)
      : ({ type: "FIXED", value: coupon.discountMinor } as const)
    : null;
  const totalsINR = computeTotals(lineInputs, displayDiscount);

  // Display totals in selected currency.
  const fmt = (paise: number) => formatMoney(fromINRMinor(paise, currency as CurrencyCode), currency as CurrencyCode);

  const [giftCardInput, setGiftCardInput] = useState("");
  const [giftCard, setGiftCard] = useState<{ code: string; redeemableMinor: number } | null>(null);
  const [giftCardMsg, setGiftCardMsg] = useState<string | null>(null);
  const giftCardMinor = giftCard ? Math.min(giftCard.redeemableMinor, totalsINR.totalMinor) : 0;
  const payableMinorINR = totalsINR.totalMinor - giftCardMinor;

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function applyGiftCard() {
    setGiftCardMsg(null);
    if (!giftCardInput.trim()) return;
    const res = await fetch("/api/v1/giftcard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: giftCardInput, payableMinor: totalsINR.totalMinor }),
    });
    const data = await res.json();
    if (!data.valid) { setGiftCard(null); setGiftCardMsg(data.error ?? "Invalid gift card."); return; }
    setGiftCard({ code: data.code, redeemableMinor: data.redeemableMinor });
    setGiftCardMsg(`Applied ${data.code} — ${fmt(data.redeemableMinor)} covered.`);
  }

  async function applyCoupon() {
    setCouponMsg(null);
    if (!couponInput.trim()) return;
    const res = await fetch("/api/v1/coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponInput, subtotalMinor: totalsINR.subtotalMinor }),
    });
    const data = await res.json();
    if (!data.valid) { setCoupon(null); setCouponMsg(data.error ?? "Invalid code."); return; }
    setCoupon({ code: data.code, discountMinor: data.discountMinor, freeShipping: data.freeShipping });
    setCouponMsg(`Applied ${data.code} — you save ${fmt(data.discountMinor)}${data.freeShipping ? " + free shipping" : ""}.`);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const addr = addressSchema.safeParse({ ...form });
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    if (!addr.success || !emailOk) {
      setError("Please fill in all required fields with valid values.");
      return;
    }
    if (items.length === 0) { setError("Your cart is empty."); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          address: addr.data,
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          couponCode: coupon?.code ?? "",
          giftCardCode: giftCard?.code ?? "",
          currency,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");

      const finish = () => { clear(); router.push(`/order/${data.orderNumber}`); };

      if (data.isMock) {
        await fetch("/api/v1/payments/mock-confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ providerOrderId: data.providerOrderId }),
        });
        finish();
        return;
      }

      if (data.provider === "stripe") {
        if (!data.clientSecret || !data.keyId) throw new Error("Stripe configuration missing.");
        // Transition to Stripe Elements phase — form stays mounted.
        setStripeData({ clientSecret: data.clientSecret, publishableKey: data.keyId, orderNumber: data.orderNumber });
        setSubmitting(false);
        return;
      }

      // UPI QR (INR, user chose QR method).
      if (payMethod === "upi_qr") {
        setUpiData({
          providerOrderId: data.providerOrderId,
          amountMinor: data.amountMinor,
          orderNumber: data.orderNumber,
          storeName: data.storeName ?? "ASPORTS ZONE",
        });
        setSubmitting(false);
        return;
      }

      // Razorpay modal (INR, card/netbanking/UPI via modal).
      const ok = await loadRazorpay();
      if (!ok || !window.Razorpay) throw new Error("Could not load payment gateway");
      const rzp = new window.Razorpay({
        key: data.keyId,
        order_id: data.providerOrderId,
        amount: data.amountMinor,
        currency: data.currency,
        name: data.storeName ?? "ASPORTS ZONE",
        description: `Order ${data.orderNumber}`,
        prefill: { name: form.fullName, email: form.email, contact: form.phone },
        theme: { color: "#4cc9ff" },
        handler: () => finish(),
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  // ── UPI QR payment phase ─────────────────────────────────────────────────────
  if (upiData) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Pay via UPI</h1>
        <div className="glass rounded-[var(--radius)] p-6">
          <UpiQrPanel
            {...upiData}
            onSuccess={() => { clear(); router.push(`/order/${upiData.orderNumber}`); }}
            onError={(msg) => { setUpiData(null); setError(msg); }}
          />
        </div>
      </div>
    );
  }

  // ── Stripe Elements payment phase ───────────────────────────────────────────
  if (stripeData) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Complete payment</h1>
        <div className="glass rounded-[var(--radius)] p-6">
          <Elements stripe={stripePromise} options={{ clientSecret: stripeData.clientSecret, appearance: { theme: "night" } }}>
            <StripePayForm
              orderNumber={stripeData.orderNumber}
              onSuccess={() => { clear(); router.push(`/order/${stripeData.orderNumber}`); }}
              onError={(msg) => { setStripeData(null); setError(msg); }}
            />
          </Elements>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Checkout</h1>
      <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="glass space-y-5 rounded-[var(--radius)] p-6">
          <h2 className="text-lg font-semibold">Shipping details</h2>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={form.email} onChange={set("email")} placeholder="you@example.com" />
          </div>
          <div>
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" required value={form.fullName} onChange={set("fullName")} placeholder="Jane Doe" />
          </div>
          <div>
            <Label htmlFor="line1">Address line 1</Label>
            <Input id="line1" required value={form.line1} onChange={set("line1")} placeholder="Street address" />
          </div>
          <div>
            <Label htmlFor="line2">Address line 2 (optional)</Label>
            <Input id="line2" value={form.line2} onChange={set("line2")} placeholder="Apartment, suite" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" required value={form.city} onChange={set("city")} />
            </div>
            <div>
              <Label htmlFor="state">State / Region</Label>
              <Input id="state" required value={form.state} onChange={set("state")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="postalCode">Postal code</Label>
              <Input id="postalCode" required value={form.postalCode} onChange={set("postalCode")} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={set("phone")} placeholder={currency === "INR" ? "+91…" : "+46…"} />
            </div>
          </div>
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        </div>

        <aside className="glass h-fit rounded-[var(--radius)] p-6">
          <h2 className="mb-4 text-lg font-semibold">Your order</h2>
          <ul className="mb-4 space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.variantId} className="flex justify-between gap-2">
                <span className="text-muted">{i.name} × {i.quantity}</span>
                <span>{fmt(i.unitPriceMinor * i.quantity)}</span>
              </li>
            ))}
          </ul>
          {/* Coupon */}
          <div className="mb-4 border-t border-[var(--border)] pt-4">
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Coupon code"
                className="h-10 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm uppercase focus:border-[var(--accent)] focus:outline-none"
              />
              <Button type="button" variant="secondary" size="sm" onClick={applyCoupon}>Apply</Button>
            </div>
            {couponMsg && (
              <p className={`mt-2 text-xs ${coupon ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>{couponMsg}</p>
            )}
            <p className="mt-1 text-xs text-muted">Try WELCOME10, FREESHIP, or SAVE500.</p>
          </div>

          {/* Gift card */}
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                value={giftCardInput}
                onChange={(e) => setGiftCardInput(e.target.value.toUpperCase())}
                placeholder="Gift card code"
                className="h-10 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm uppercase focus:border-[var(--accent)] focus:outline-none"
              />
              <Button type="button" variant="secondary" size="sm" onClick={applyGiftCard}>Apply</Button>
            </div>
            {giftCardMsg && (
              <p className={`mt-2 text-xs ${giftCard ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>{giftCardMsg}</p>
            )}
          </div>

          <dl className="space-y-2 border-t border-[var(--border)] pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{fmt(totalsINR.subtotalMinor)}</dd></div>
            {totalsINR.discountMinor > 0 && (
              <div className="flex justify-between text-[var(--success)]"><dt>Discount {coupon ? `(${coupon.code})` : ""}</dt><dd>−{fmt(totalsINR.discountMinor)}</dd></div>
            )}
            <div className="flex justify-between"><dt className="text-muted">{currency === "INR" ? "GST (18%)" : "VAT (25%)"}</dt><dd>{fmt(totalsINR.taxMinor)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{totalsINR.shippingMinor === 0 ? "Free" : fmt(totalsINR.shippingMinor)}</dd></div>
            <div className="mt-2 flex justify-between border-t border-[var(--border)] pt-2 text-base font-semibold"><dt>Total</dt><dd>{fmt(totalsINR.totalMinor)}</dd></div>
            {giftCardMinor > 0 && (
              <div className="flex justify-between text-[var(--success)]"><dt>Gift card ({giftCard?.code})</dt><dd>−{fmt(giftCardMinor)}</dd></div>
            )}
            <div className="flex justify-between text-base font-semibold"><dt>Payable</dt><dd className="gradient-text">{fmt(payableMinorINR)}</dd></div>
          </dl>
          {/* Payment method selector — INR only */}
          {currency === "INR" && (
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPayMethod("card")}
                className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition-colors ${
                  payMethod === "card"
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "border-[var(--border)] text-muted hover:text-foreground"
                }`}
              >
                <CreditCard className="h-4 w-4" /> Card / UPI
              </button>
              <button
                type="button"
                onClick={() => setPayMethod("upi_qr")}
                className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition-colors ${
                  payMethod === "upi_qr"
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "border-[var(--border)] text-muted hover:text-foreground"
                }`}
              >
                <QrCode className="h-4 w-4" /> UPI QR
              </button>
            </div>
          )}
          <Button type="submit" size="lg" className="mt-4 w-full" disabled={submitting || items.length === 0}>
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Lock className="h-4 w-4" /> {payMethod === "upi_qr" && currency === "INR" ? "Generate QR" : `Pay ${fmt(payableMinorINR)}`}</>}
          </Button>
          <p className="mt-3 text-center text-xs text-muted">
            {currency === "INR" ? "Secured by Razorpay · 256-bit encryption" : "Secured by Stripe · 256-bit encryption"}
          </p>
        </aside>
      </form>
    </div>
  );
}
