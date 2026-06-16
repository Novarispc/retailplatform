import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, LogOut, Gift, Sparkles, Download, ShieldX } from "lucide-react";
import { auth, signOut } from "@/lib/auth";
import { listUserOrders } from "@/server/services/order";
import { getLoyalty, ensureReferralCode } from "@/server/services/loyalty";
import { deleteUserAccount } from "@/server/services/account";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMoney, type CurrencyCode } from "@/lib/money";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata = { title: "My account" };

const STATUS_COLOR: Record<string, string> = {
  PAID: "text-[var(--success)]",
  PENDING: "text-[var(--accent)]",
  REFUNDED: "text-[var(--danger)]",
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in?from=/account");

  const [orders, loyalty, referralCode] = await Promise.all([
    listUserOrders(session.user.id),
    getLoyalty(session.user.id),
    ensureReferralCode(session.user.id),
  ]);
  const referralLink = `${appUrl}/sign-up?ref=${referralCode}`;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My account</h1>
          <p className="mt-1 text-muted">{session.user.email}</p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <Button variant="outline" type="submit"><LogOut className="h-4 w-4" /> Sign out</Button>
        </form>
      </div>

      <div className="mb-6 flex items-center gap-2">
        <Badge>{session.user.role}</Badge>
      </div>

      {/* Loyalty + referral */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="glass rounded-[var(--radius)] p-6">
          <div className="mb-2 flex items-center gap-2 text-muted">
            <Sparkles className="h-4 w-4 text-[var(--accent)]" />
            <span className="text-xs uppercase tracking-wide">ASZ Points</span>
          </div>
          <p className="text-3xl font-bold gradient-text">{loyalty?.points ?? 0}</p>
          <p className="mt-1 text-xs text-muted">Earn 1 point per ₹10 spent.</p>
        </div>
        <div className="glass rounded-[var(--radius)] p-6">
          <div className="mb-2 flex items-center gap-2 text-muted">
            <Gift className="h-4 w-4 text-[var(--accent-3)]" />
            <span className="text-xs uppercase tracking-wide">Refer & earn</span>
          </div>
          <p className="font-mono text-lg">{referralCode}</p>
          <p className="mt-1 break-all text-xs text-muted">{referralLink}</p>
        </div>
      </div>

      {/* GDPR / privacy */}
      <div className="glass mb-8 rounded-[var(--radius)] p-6">
        <h2 className="mb-3 text-sm font-semibold">Privacy &amp; data</h2>
        <div className="flex flex-wrap gap-3">
          <a href="/api/v1/account/export">
            <Button variant="outline" type="button"><Download className="h-4 w-4" /> Export my data</Button>
          </a>
          <form
            action={async () => {
              "use server";
              const s = await auth();
              if (s?.user) {
                await deleteUserAccount(s.user.id);
                await signOut({ redirectTo: "/" });
              }
            }}
          >
            <Button variant="danger" type="submit"><ShieldX className="h-4 w-4" /> Delete my account</Button>
          </form>
        </div>
        <p className="mt-2 text-xs text-muted">Export downloads all your data as JSON. Deletion removes your personal data; orders are retained anonymized for accounting.</p>
      </div>

      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
        <Package className="h-5 w-5 text-[var(--accent)]" /> Order history
      </h2>

      {orders.length === 0 ? (
        <div className="glass rounded-[var(--radius)] p-10 text-center text-muted">
          No orders yet.{" "}
          <Link href="/catalog" className="text-[var(--accent)] hover:underline">Start shopping →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/order/${o.number}`}
              className="glass flex items-center justify-between rounded-[var(--radius)] p-5 transition-colors hover:border-[var(--accent)]/40"
            >
              <div>
                <p className="font-mono text-sm">{o.number}</p>
                <p className="mt-1 text-xs text-muted">
                  {new Date(o.createdAt).toLocaleDateString()} · {o.items.length} item(s)
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatMoney(o.totalMinor, o.currency as CurrencyCode)}</p>
                <p className={`text-xs ${STATUS_COLOR[o.status] ?? "text-muted"}`}>{o.status}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
