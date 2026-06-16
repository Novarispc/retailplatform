"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AnalyticsSummary } from "@/server/services/analytics";

const ACCENT = "#4cc9ff";
const ACCENT2 = "#9d7bff";
const STATUS_COLORS: Record<string, string> = {
  PAID: "#34d399",
  DELIVERED: "#34d399",
  PENDING: "#4cc9ff",
  FULFILLED: "#9d7bff",
  SHIPPED: "#9d7bff",
  CANCELLED: "#fb7185",
  REFUNDED: "#fb7185",
};

const rupees = (minor: number) => `₹${Math.round(minor / 100).toLocaleString("en-IN")}`;

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-[var(--radius)] p-5">
      <h3 className="mb-4 text-sm font-semibold text-muted">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const tooltipStyle = {
  background: "#0c0e18",
  border: "1px solid #1e2233",
  borderRadius: 12,
  fontSize: 12,
  color: "#eef0f6",
};

export function AnalyticsCharts({ data }: { data: AnalyticsSummary }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Revenue (last 30 days)">
        <AreaChart data={data.series} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ACCENT} stopOpacity={0.5} />
              <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" tick={{ fill: "#9aa3b8", fontSize: 10 }} interval={4} />
          <YAxis tick={{ fill: "#9aa3b8", fontSize: 10 }} tickFormatter={(v) => `₹${Math.round(v / 100000)}k`} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [rupees(Number(v)), "Revenue"]} />
          <Area type="monotone" dataKey="revenueMinor" stroke={ACCENT} strokeWidth={2} fill="url(#rev)" />
        </AreaChart>
      </Panel>

      <Panel title="Orders (last 30 days)">
        <BarChart data={data.series} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <XAxis dataKey="day" tick={{ fill: "#9aa3b8", fontSize: 10 }} interval={4} />
          <YAxis allowDecimals={false} tick={{ fill: "#9aa3b8", fontSize: 10 }} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
          <Bar dataKey="orders" fill={ACCENT2} radius={[3, 3, 0, 0]} />
        </BarChart>
      </Panel>

      <Panel title="Top products by revenue">
        <BarChart data={data.topProducts} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
          <XAxis type="number" hide tickFormatter={rupees} />
          <YAxis type="category" dataKey="name" width={120} tick={{ fill: "#9aa3b8", fontSize: 10 }} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [rupees(Number(v)), "Revenue"]} />
          <Bar dataKey="revenueMinor" fill={ACCENT} radius={[0, 3, 3, 0]} />
        </BarChart>
      </Panel>

      <Panel title="Orders by status">
        <PieChart>
          <Pie data={data.statusBreakdown} dataKey="count" nameKey="status" innerRadius={50} outerRadius={90} paddingAngle={3}>
            {data.statusBreakdown.map((s) => (
              <Cell key={s.status} fill={STATUS_COLORS[s.status] ?? "#9aa3b8"} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </Panel>
    </div>
  );
}
