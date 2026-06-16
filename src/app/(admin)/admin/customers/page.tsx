export const dynamic = "force-dynamic";
import Link from "next/link";
import { listCustomers } from "@/server/services/admin";
import { Table, THead, TH, TR, TD } from "@/components/admin/table";

export const metadata = { title: "Customers · Admin", robots: { index: false } };

type SP = Promise<{ q?: string; page?: string }>;

export default async function AdminCustomersPage({ searchParams }: { searchParams: SP }) {
  const { q, page } = await searchParams;
  const { items, total, pageSize } = await listCustomers({ q, page: Number(page) || 1 });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const cur = Number(page) || 1;

  return (
    <div>
      <h1 className="mb-1 text-3xl font-bold tracking-tight">Customers</h1>
      <p className="mb-6 text-muted">{total} customer(s)</p>

      <form action="/admin/customers" className="mb-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by email…"
          className="h-10 w-full max-w-sm rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 text-sm focus:border-[var(--accent)] focus:outline-none"
        />
      </form>

      <Table>
        <THead>
          <TR><TH>Name</TH><TH>Email</TH><TH>Orders</TH><TH>Joined</TH></TR>
        </THead>
        <tbody>
          {items.map((c) => (
            <TR key={c.id}>
              <TD className="font-medium">{c.name ?? "—"}</TD>
              <TD className="text-muted">{c.email}</TD>
              <TD>{c._count.orders}</TD>
              <TD className="text-xs text-muted">{new Date(c.createdAt).toLocaleDateString()}</TD>
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
                href={`/admin/customers?${new URLSearchParams({ ...(q ? { q } : {}), page: String(n) })}`}
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
