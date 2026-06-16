export const dynamic = "force-dynamic";
import { Megaphone } from "lucide-react";
import { listCoupons, listGiftCards } from "@/server/services/admin";
import { toggleCouponAction, toggleFeatureFlagAction } from "@/server/actions/admin";
import { CouponForm } from "@/components/admin/coupon-form";
import { GiftCardForm } from "@/components/admin/giftcard-form";
import { HeroSettingsForm } from "@/app/(admin)/admin/marketing/hero-settings";
import { getHeroSettings } from "@/server/services/store";
import { Table, THead, TH, TR, TD, StatusBadge } from "@/components/admin/table";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Marketing · Admin", robots: { index: false } };

function describe(c: { type: string; value: number }) {
  if (c.type === "PERCENT") return `${c.value}% off`;
  if (c.type === "FIXED") return `${formatMoney(c.value)} off`;
  return "Free shipping";
}

export default async function MarketingPage() {
  const [coupons, giftCards, aiAssistantFlag, heroSettings] = await Promise.all([
    listCoupons(),
    listGiftCards(),
    prisma.featureFlag.findUnique({ where: { key: "ai_assistant" } }),
    getHeroSettings(),
  ]);
  const assistantEnabled = aiAssistantFlag?.enabled ?? false;

  return (
    <div>
      <h1 className="mb-1 flex items-center gap-2 text-3xl font-bold tracking-tight">
        <Megaphone className="h-7 w-7 text-[var(--accent)]" /> Marketing
      </h1>
      <p className="mb-6 text-muted">Coupons & promotions ({coupons.length})</p>

      <div className="glass mb-8 rounded-2xl p-6">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">AI Chat</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted">
              Toggle whether the storefront exposes the floating AI shopping assistant to customers.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a href="#hero-settings" className="rounded-full bg-[var(--surface-2)] px-4 py-2 text-sm font-medium text-foreground hover:opacity-90">Edit homepage hero</a>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                assistantEnabled ? "bg-[var(--success)]/15 text-[var(--success)]" : "bg-[var(--danger)]/15 text-[var(--danger)]"
              }`}
            >
              {assistantEnabled ? "Enabled" : "Disabled"}
            </span>
            <form action={toggleFeatureFlagAction}>
              <input type="hidden" name="key" value="ai_assistant" />
              <input type="hidden" name="enabled" value={assistantEnabled ? "false" : "true"} />
              <button
                type="submit"
                className="rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-5 py-2.5 text-sm font-semibold text-[#06070d] transition hover:opacity-90"
              >
                {assistantEnabled ? "Disable AI chat" : "Enable AI chat"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <HeroSettingsForm initial={heroSettings} />

      <CouponForm />

      <Table>
        <THead>
          <TR><TH>Code</TH><TH>Discount</TH><TH>Min spend</TH><TH>Used</TH><TH>Status</TH><TH className="text-right">Action</TH></TR>
        </THead>
        <tbody>
          {coupons.map((c) => (
            <TR key={c.id}>
              <TD className="font-mono">{c.code}</TD>
              <TD>{describe(c)}</TD>
              <TD className="text-muted">{c.minSpendMinor > 0 ? formatMoney(c.minSpendMinor) : "—"}</TD>
              <TD>{c.timesRedeemed}{c.maxRedemptions ? ` / ${c.maxRedemptions}` : ""}</TD>
              <TD><StatusBadge status={c.active ? "PAID" : "CANCELLED"} /></TD>
              <TD className="text-right">
                <form action={toggleCouponAction}>
                  <input type="hidden" name="id" value={c.id} />
                  <button className="text-sm text-[var(--accent)] hover:underline">{c.active ? "Disable" : "Enable"}</button>
                </form>
              </TD>
            </TR>
          ))}
        </tbody>
      </Table>

      <h2 className="mb-4 mt-10 text-xl font-semibold">Gift cards</h2>
      <GiftCardForm />
      <Table>
        <THead>
          <TR><TH>Code</TH><TH>Balance</TH><TH>Initial</TH><TH>Status</TH></TR>
        </THead>
        <tbody>
          {giftCards.map((g) => (
            <TR key={g.id}>
              <TD className="font-mono">{g.code}</TD>
              <TD>{formatMoney(g.balanceMinor)}</TD>
              <TD className="text-muted">{formatMoney(g.initialMinor)}</TD>
              <TD><StatusBadge status={g.active && g.balanceMinor > 0 ? "PAID" : "CANCELLED"} /></TD>
            </TR>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
