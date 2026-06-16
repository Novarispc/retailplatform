export const dynamic = "force-dynamic";
import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { listOrdersAdmin } from "@/server/services/admin";
import { Table, THead, TH, TR, TD, StatusBadge } from "@/components/admin/table";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export const metadata = { title: "Orders · Admin", robots: { index: false } };

type SP = Promise<{ status?: string; page?: string }>;

const FILTERS: (OrderStatus | "ALL")[] = ["ALL", "PENDING", "PAID", "FULFILLED", "SHIPPED", "DELIVERED", "REFUNDED", "CANCELLED"];

export default async function AdminOrdersPage({ searchParams }: { searchParams: SP }) {
  const { status, page } = await searchParams;
  const statusFilter = status && status !== "ALL" ? (status as OrderStatus) : undefined;
  const { items, total, pageSize } = await listOrdersAdmin({ status: statusFilter, page: Number(page) || 1 });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const cur = Number(page) || 1;

  return (
    <div>
      <h1 className="mb-1 text-3xl font-bold tracking-tight">Orders</h1>
      <p className="mb-6 text-muted">{total} order(s)</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "ALL" ? "/admin/orders" : `/admin/orders?status=${f}`}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-colors",
              (status ?? "ALL") === f ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--border)] text-muted hover:text-foreground",
            )}
          >
            {f}
          </Link>
        ))}
      </div>

      <Table>
        <THead>
          <TR>
            <TH>Order</TH>
            <TH>Customer</TH>
            <TH>Items</TH>
            <TH>Total</TH>
            <TH>Status</TH>
            <TH>Date</TH>
          </TR>
        </THead>
        <tbody>
          {items.map((o) => (
            <TR key={o.id}>
              <TD>
                <Link href={`/admin/orders/${o.id}`} className="font-mono text-[var(--accent)] hover:underline">{o.number}</Link>
              </TD>
              <TD className="text-muted">{o.user?.email ?? o.email}</TD>
              <TD>{o.items.length}</TD>
              <TD>{formatMoney(o.totalMinor)}</TD>
              <TD><StatusBadge status={o.status} /></TD>
              <TD className="text-xs text-muted">{new Date(o.createdAt).toLocaleDateString()}</TD>
            </TR>
          ))}
        </tbody>
      </Table>

      {totalPages > 1 && (
        <nav className="mt-6 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => {
            const n = i + 1;
            return (
              <Link
                key={n}
                href={`/admin/orders?${new URLSearchParams({ ...(status ? { status } : {}), page: String(n) })}`}
                className={`grid h-9 w-9 place-items-center rounded-full text-sm ${n === cur ? "bg-[var(--accent)] text-[#06070d]" : "border border-[var(--border)] text-muted"}`}
              >
                {n}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
