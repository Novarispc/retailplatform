import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Users, BarChart3, ArrowUpRight } from "lucide-react";
import { Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getActiveTenant } from "@/lib/tenant";
import { formatMoney } from "@/lib/money";
import { getAI } from "@/lib/ai";
import { aiEnabled } from "@/lib/ai/claude";

async function aiInsight(stats: { revenue: number; orders: number; products: number; customers: number; lowStock: number }) {
  if (!aiEnabled()) return null;
  try {
    const reply = await getAI().complete(
      "You are a retail analytics advisor. Given store metrics, give ONE concise, actionable insight (max 2 sentences). No preamble.",
      [
        {
          role: "user",
          content: `Revenue(paid): ₹${(stats.revenue / 100).toFixed(0)}, Orders: ${stats.orders}, Products: ${stats.products}, Customers: ${stats.customers}, Low-stock items: ${stats.lowStock}.`,
        },
      ],
      { fast: true },
    );
    return reply;
  } catch {
    return null;
  }
}

export const metadata = { title: "Admin", robots: { index: false } };

export default async function AdminPage() {
  const tenant = await getActiveTenant();
  const [products, orders, customers, paidAgg, recent, lowStock] = await Promise.all([
    prisma.product.count({ where: { tenantId: tenant.id } }),
    prisma.order.count({ where: { tenantId: tenant.id } }),
    prisma.user.count({ where: { tenantId: tenant.id, role: "CUSTOMER" } }),
    prisma.order.aggregate({ where: { tenantId: tenant.id, status: "PAID" }, _sum: { totalMinor: true } }),
    prisma.order.findMany({ where: { tenantId: tenant.id }, orderBy: { createdAt: "desc" }, take: 5, include: { items: true } }),
    prisma.inventory.count({ where: { quantity: { lte: 5 }, variant: { product: { tenantId: tenant.id } } } }),
  ]);

  const insight = await aiInsight({
    revenue: paidAgg._sum.totalMinor ?? 0,
    orders,
    products,
    customers,
    lowStock,
  });

  const stats = [
    { label: "Revenue (paid)", value: formatMoney(paidAgg._sum.totalMinor ?? 0), icon: BarChart3, href: "/admin/orders" },
    { label: "Orders", value: orders, icon: ShoppingCart, href: "/admin/orders" },
    { label: "Products", value: products, icon: Package, href: "/admin/products" },
    { label: "Customers", value: customers, icon: Users, href: "/admin/customers" },
  ];

  return (
    <div>
      <h1 className="mb-1 flex items-center gap-2 text-3xl font-bold tracking-tight">
        <LayoutDashboard className="h-7 w-7 text-[var(--accent)]" /> Dashboard
      </h1>
      <p className="mb-8 text-muted">Executive overview · {lowStock} item(s) low on stock</p>

      {insight && (
        <div className="glass mb-6 flex items-start gap-3 rounded-[var(--radius)] p-5">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" />
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">AI insight</p>
            <p className="mt-1 text-sm">{insight}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="glass group rounded-[var(--radius)] p-6 transition-colors hover:border-[var(--accent)]/40">
            <div className="mb-3 flex items-center justify-between">
              <s.icon className="h-6 w-6 text-[var(--accent)]" />
              <ArrowUpRight className="h-4 w-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="glass mt-8 rounded-[var(--radius)] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm text-[var(--accent)] hover:underline">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <p className="py-6 text-center text-muted">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {recent.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between py-3 text-sm hover:text-[var(--accent)]">
                  <span className="font-mono">{o.number}</span>
                  <span className="text-muted">{o.items.length} item(s)</span>
                  <span>{formatMoney(o.totalMinor)}</span>
                  <span className="text-xs text-muted">{o.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
