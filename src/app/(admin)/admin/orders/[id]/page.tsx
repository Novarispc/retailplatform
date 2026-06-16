import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getOrderAdmin } from "@/server/services/admin";
import { nextStatuses } from "@/server/services/order-status";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { Table, THead, TH, TR, TD, StatusBadge } from "@/components/admin/table";
import { formatMoney, type CurrencyCode } from "@/lib/money";

export const metadata = { title: "Order · Admin", robots: { index: false } };

type Params = Promise<{ id: string }>;

export default async function AdminOrderPage({ params }: { params: Params }) {
  const { id } = await params;
  const order = await getOrderAdmin(id);
  if (!order) notFound();
  const cur = order.currency as CurrencyCode;

  return (
    <div>
      <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-bold">{order.number}</h1>
          <p className="mt-1 text-muted">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Table>
            <THead>
              <TR><TH>Item</TH><TH>Qty</TH><TH>Unit</TH><TH className="text-right">Total</TH></TR>
            </THead>
            <tbody>
              {order.items.map((i) => (
                <TR key={i.id}>
                  <TD>{i.name}</TD>
                  <TD>{i.quantity}</TD>
                  <TD>{formatMoney(i.unitPriceMinor, cur)}</TD>
                  <TD className="text-right">{formatMoney(i.unitPriceMinor * i.quantity, cur)}</TD>
                </TR>
              ))}
            </tbody>
          </Table>

          <div className="glass rounded-[var(--radius)] p-6">
            <h2 className="mb-4 font-semibold">Update status</h2>
            <OrderStatusForm orderId={order.id} current={order.status} options={nextStatuses(order.status)} />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="glass rounded-[var(--radius)] p-6 text-sm">
            <h2 className="mb-3 font-semibold">Summary</h2>
            <dl className="space-y-2">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatMoney(order.subtotalMinor, cur)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Tax</dt><dd>{formatMoney(order.taxMinor, cur)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{order.shippingMinor === 0 ? "Free" : formatMoney(order.shippingMinor, cur)}</dd></div>
              <div className="flex justify-between border-t border-[var(--border)] pt-2 font-semibold"><dt>Total</dt><dd className="gradient-text">{formatMoney(order.totalMinor, cur)}</dd></div>
            </dl>
            <p className="mt-3 text-xs text-muted">Payment: {order.payment?.status ?? "—"}</p>
          </div>

          <div className="glass rounded-[var(--radius)] p-6 text-sm">
            <h2 className="mb-3 font-semibold">Customer</h2>
            <p>{order.user?.name ?? "Guest"}</p>
            <p className="text-muted">{order.user?.email ?? order.email}</p>
            {order.shippingAddress && (
              <address className="mt-3 not-italic text-muted">
                {order.shippingAddress.fullName}<br />
                {order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                {order.shippingAddress.country}
              </address>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
