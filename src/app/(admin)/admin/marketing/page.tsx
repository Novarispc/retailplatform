export const dynamic = "force-dynamic";
import { Megaphone } from "lucide-react";
import { listCoupons, listGiftCards } from "@/server/services/admin";
import { toggleCouponAction } from "@/server/actions/admin";
import { CouponForm } from "@/components/admin/coupon-form";
import { GiftCardForm } from "@/components/admin/giftcard-form";
import { Table, THead, TH, TR, TD, StatusBadge } from "@/components/admin/table";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Marketing · Admin", robots: { index: false } };

function describe(c: { type: string; value: number }) {
  if (c.type === "PERCENT") return `${c.value}% off`;
  if (c.type === "FIXED") return `${formatMoney(c.value)} off`;
  return "Free shipping";
}

export default async function MarketingPage() {
  const [coupons, giftCards] = await Promise.all([listCoupons(), listGiftCards()]);

  return (
    <div>
      <h1 className="mb-1 flex items-center gap-2 text-3xl font-bold tracking-tight">
        <Megaphone className="h-7 w-7 text-[var(--accent)]" /> Marketing
      </h1>
      <p className="mb-6 text-muted">Coupons & promotions ({coupons.length})</p>

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
