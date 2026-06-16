import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, Package } from "lucide-react";
import { auth } from "@/lib/auth";
import { getOrderByNumber } from "@/server/services/order";
import { Button } from "@/components/ui/button";
import { formatMoney, type CurrencyCode } from "@/lib/money";

type Params = Promise<{ number: string }>;

export const metadata = { title: "Order confirmation", robots: { index: false } };

export default async function OrderPage({ params }: { params: Params }) {
  const { number } = await params;
  const session = await auth();
  const order = await getOrderByNumber(number, session?.user?.id ?? null);
  if (!order) notFound();

  const paid = order.status === "PAID" || order.payment?.status === "CAPTURED";

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="glass rounded-[var(--radius)] p-8 text-center">
        <div className={`mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full ${paid ? "bg-[var(--success)]/15 text-[var(--success)]" : "bg-[var(--accent)]/15 text-[var(--accent)]"}`}>
          {paid ? <CheckCircle2 className="h-8 w-8" /> : <Clock className="h-8 w-8" />}
        </div>
        <h1 className="text-2xl font-bold">{paid ? "Order confirmed!" : "Order received"}</h1>
        <p className="mt-2 text-muted">
          {paid
            ? "Thank you — your payment was successful and your order is being prepared."
            : "We're waiting for payment confirmation. This page updates once it's settled."}
        </p>
        <p className="mt-4 inline-block rounded-full bg-[var(--surface-2)] px-4 py-1.5 font-mono text-sm">
          {order.number}
        </p>
      </div>

      <div className="glass mt-6 rounded-[var(--radius)] p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold"><Package className="h-4 w-4 text-[var(--accent)]" /> Order items</h2>
        <ul className="space-y-2 text-sm">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between">
              <span className="text-muted">{i.name} × {i.quantity}</span>
              <span>{formatMoney(i.unitPriceMinor * i.quantity, order.currency as CurrencyCode)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-[var(--border)] pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatMoney(order.subtotalMinor, order.currency as CurrencyCode)}</dd></div>
          {order.discountMinor > 0 && (
            <div className="flex justify-between text-[var(--success)]"><dt>Discount {order.couponCode ? `(${order.couponCode})` : ""}</dt><dd>−{formatMoney(order.discountMinor, order.currency as CurrencyCode)}</dd></div>
          )}
          <div className="flex justify-between"><dt className="text-muted">Tax</dt><dd>{formatMoney(order.taxMinor, order.currency as CurrencyCode)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{order.shippingMinor === 0 ? "Free" : formatMoney(order.shippingMinor, order.currency as CurrencyCode)}</dd></div>
          <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd className="gradient-text">{formatMoney(order.totalMinor, order.currency as CurrencyCode)}</dd></div>
        </dl>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Link href="/catalog"><Button variant="secondary">Continue shopping</Button></Link>
        <Link href="/account"><Button>View my orders</Button></Link>
      </div>
    </div>
  );
}
