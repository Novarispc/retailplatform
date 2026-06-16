import { TrendingUp, IndianRupee, ShoppingCart, Repeat, UserPlus, Percent } from "lucide-react";
import { getAnalytics } from "@/server/services/analytics";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import { LiveOrders } from "@/components/admin/live-orders";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Analytics · Admin", robots: { index: false } };

export default async function AnalyticsPage() {
  const data = await getAnalytics(30);
  const k = data.kpis;

  const cards = [
    { label: "Revenue (paid)", value: formatMoney(k.revenueMinor), icon: IndianRupee },
    { label: "Avg order value", value: formatMoney(k.aovMinor), icon: TrendingUp },
    { label: "Paid orders", value: k.paidOrders, icon: ShoppingCart },
    { label: "Paid conversion", value: `${k.paidConversionPct}%`, icon: Percent },
    { label: "New customers (30d)", value: k.newCustomers30d, icon: UserPlus },
    { label: "Repeat customers", value: `${k.repeatCustomerPct}%`, icon: Repeat },
  ];

  return (
    <div>
      <h1 className="mb-1 flex items-center gap-2 text-3xl font-bold tracking-tight">
        <TrendingUp className="h-7 w-7 text-[var(--accent)]" /> Analytics
      </h1>
      <p className="mb-6 text-muted">Store performance over the last 30 days</p>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="glass rounded-[var(--radius)] p-5">
            <c.icon className="mb-2 h-5 w-5 text-[var(--accent)]" />
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-xs text-muted">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <LiveOrders />
      </div>

      <AnalyticsCharts data={data} />
    </div>
  );
}
