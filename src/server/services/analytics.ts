import { prisma } from "@/lib/prisma";
import { getActiveTenant } from "@/lib/tenant";
import { Prisma } from "@prisma/client";

export interface DayPoint {
  day: string; // YYYY-MM-DD
  revenueMinor: number;
  orders: number;
}

export interface TopProduct {
  name: string;
  unitsSold: number;
  revenueMinor: number;
}

export interface AnalyticsSummary {
  kpis: {
    revenueMinor: number;
    paidOrders: number;
    totalOrders: number;
    aovMinor: number;
    paidConversionPct: number; // paid / total orders
    newCustomers30d: number;
    repeatCustomerPct: number;
  };
  series: DayPoint[];
  topProducts: TopProduct[];
  statusBreakdown: { status: string; count: number }[];
}

/** Last `days` of paid revenue + order counts, zero-filled per day. */
async function revenueSeries(tenantId: string, days: number): Promise<DayPoint[]> {
  const rows = await prisma.$queryRaw<{ day: Date; revenue: bigint; orders: bigint }[]>`
    SELECT date_trunc('day', "createdAt") AS day,
           COALESCE(SUM("totalMinor"), 0) AS revenue,
           COUNT(*) AS orders
    FROM "Order"
    WHERE "tenantId" = ${tenantId}
      AND "status" IN ('PAID','FULFILLED','SHIPPED','DELIVERED')
      AND "createdAt" >= NOW() - (${`${days} days`}::interval)
    GROUP BY 1
    ORDER BY 1
  `;
  const byDay = new Map(
    rows.map((r) => [r.day.toISOString().slice(0, 10), { revenue: Number(r.revenue), orders: Number(r.orders) }]),
  );

  const out: DayPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    const hit = byDay.get(key);
    out.push({ day: key.slice(5), revenueMinor: hit?.revenue ?? 0, orders: hit?.orders ?? 0 });
  }
  return out;
}

async function topProducts(tenantId: string, limit: number): Promise<TopProduct[]> {
  const rows = await prisma.$queryRaw<{ name: string; units: bigint; revenue: bigint }[]>`
    SELECT oi."name" AS name,
           SUM(oi."quantity") AS units,
           SUM(oi."quantity" * oi."unitPriceMinor") AS revenue
    FROM "OrderItem" oi
    JOIN "Order" o ON o."id" = oi."orderId"
    WHERE o."tenantId" = ${tenantId}
      AND o."status" IN ('PAID','FULFILLED','SHIPPED','DELIVERED')
    GROUP BY oi."name"
    ORDER BY revenue DESC
    LIMIT ${limit}
  `;
  return rows.map((r) => ({ name: r.name, unitsSold: Number(r.units), revenueMinor: Number(r.revenue) }));
}

export async function getAnalytics(days = 30): Promise<AnalyticsSummary> {
  const tenant = await getActiveTenant();
  const paidStatuses: Prisma.OrderWhereInput["status"] = {
    in: ["PAID", "FULFILLED", "SHIPPED", "DELIVERED"],
  };

  const [series, top, paidAgg, totalOrders, newCustomers30d, statusGroups, repeatRows] =
    await Promise.all([
      revenueSeries(tenant.id, days),
      topProducts(tenant.id, 6),
      prisma.order.aggregate({
        where: { tenantId: tenant.id, status: paidStatuses },
        _sum: { totalMinor: true },
        _count: true,
      }),
      prisma.order.count({ where: { tenantId: tenant.id } }),
      prisma.user.count({
        where: {
          tenantId: tenant.id,
          role: "CUSTOMER",
          createdAt: { gte: new Date(Date.now() - 30 * 86400000) },
        },
      }),
      prisma.order.groupBy({
        by: ["status"],
        where: { tenantId: tenant.id },
        _count: true,
      }),
      prisma.$queryRaw<{ repeat: bigint; total: bigint }[]>`
        SELECT COUNT(*) FILTER (WHERE c > 1) AS repeat, COUNT(*) AS total
        FROM (
          SELECT "userId", COUNT(*) c
          FROM "Order"
          WHERE "tenantId" = ${tenant.id} AND "userId" IS NOT NULL
            AND "status" IN ('PAID','FULFILLED','SHIPPED','DELIVERED')
          GROUP BY "userId"
        ) t
      `,
    ]);

  const revenueMinor = paidAgg._sum.totalMinor ?? 0;
  const paidOrders = paidAgg._count;
  const repeat = repeatRows[0];

  return {
    kpis: {
      revenueMinor,
      paidOrders,
      totalOrders,
      aovMinor: paidOrders > 0 ? Math.round(revenueMinor / paidOrders) : 0,
      paidConversionPct: totalOrders > 0 ? Math.round((paidOrders / totalOrders) * 100) : 0,
      newCustomers30d,
      repeatCustomerPct:
        repeat && Number(repeat.total) > 0
          ? Math.round((Number(repeat.repeat) / Number(repeat.total)) * 100)
          : 0,
    },
    series,
    topProducts: top,
    statusBreakdown: statusGroups.map((g) => ({ status: g.status, count: g._count })),
  };
}
