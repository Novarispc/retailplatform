export const dynamic = "force-dynamic";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, Download } from "lucide-react";
import { listProductsAdmin } from "@/server/services/admin";
import { deleteProductAction } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Table, THead, TH, TR, TD, StatusBadge } from "@/components/admin/table";
import { ProductImport } from "@/components/admin/product-import";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Products · Admin", robots: { index: false } };

type SP = Promise<{ q?: string; page?: string }>;

export default async function AdminProductsPage({ searchParams }: { searchParams: SP }) {
  const { q, page } = await searchParams;
  const { items, total, pageSize } = await listProductsAdmin({ q, page: Number(page) || 1 });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const cur = Number(page) || 1;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted">{total} total</p>
        </div>
        <div className="flex gap-2">
          <a href="/api/v1/admin/products/export"><Button variant="outline" type="button"><Download className="h-4 w-4" /> Export CSV</Button></a>
          <ProductImport />
          <Link href="/admin/products/new"><Button><Plus className="h-4 w-4" /> New product</Button></Link>
        </div>
      </div>

      <form action="/admin/products" className="mb-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search products…"
          className="h-10 w-full max-w-sm rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 text-sm focus:border-[var(--accent)] focus:outline-none"
        />
      </form>

      <Table>
        <THead>
          <TR>
            <TH>Product</TH>
            <TH>Category</TH>
            <TH>Price</TH>
            <TH>Stock</TH>
            <TH>Status</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <tbody>
          {items.map((p) => {
            const inv = p.variants[0]?.inventory;
            const stock = inv ? inv.quantity - inv.reserved : 0;
            return (
              <TR key={p.id}>
                <TD>
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-[var(--surface-2)]">
                      {p.images[0]?.url && <Image src={p.images[0].url} alt={p.name} fill className="object-cover" sizes="40px" />}
                    </div>
                    <span className="font-medium">{p.name}</span>
                  </div>
                </TD>
                <TD className="text-muted">{p.category?.name ?? "—"}</TD>
                <TD>{formatMoney(p.priceMinor)}</TD>
                <TD className={stock <= 5 ? "text-[var(--danger)]" : ""}>{stock}</TD>
                <TD><StatusBadge status={p.active ? "PAID" : "CANCELLED"} /></TD>
                <TD>
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/products/${p.id}`} aria-label="Edit" className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-[var(--surface-2)] hover:text-foreground">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <form action={deleteProductAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <button aria-label="Delete" className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-[var(--surface-2)] hover:text-[var(--danger)]">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </TD>
              </TR>
            );
          })}
        </tbody>
      </Table>

      {totalPages > 1 && (
        <nav className="mt-6 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => {
            const n = i + 1;
            return (
              <Link
                key={n}
                href={`/admin/products?${new URLSearchParams({ ...(q ? { q } : {}), page: String(n) })}`}
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
