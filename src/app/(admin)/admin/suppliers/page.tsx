export const dynamic = "force-dynamic";
import { Truck } from "lucide-react";
import { listSuppliers, listPurchaseOrders } from "@/server/services/admin";
import { createReorderPOAction } from "@/server/actions/admin";
import { SupplierForm } from "@/components/admin/supplier-form";
import { SupplierRow } from "@/components/admin/supplier-row";
import { Table, THead, TH, TR, TD, StatusBadge } from "@/components/admin/table";

export const metadata = { title: "Suppliers · Admin", robots: { index: false } };

export default async function SuppliersPage() {
  const [suppliers, pos] = await Promise.all([listSuppliers(), listPurchaseOrders()]);

  return (
    <div>
      <h1 className="mb-1 flex items-center gap-2 text-3xl font-bold tracking-tight">
        <Truck className="h-7 w-7 text-[var(--accent)]" /> Suppliers
      </h1>
      <p className="mb-6 text-muted">Procurement & purchase orders</p>

      <SupplierForm />

      <Table>
        <THead>
          <TR><TH>Supplier</TH><TH>Email</TH><TH>Phone</TH><TH>POs</TH><TH className="text-right">Action</TH></TR>
        </THead>
        <tbody>
          {suppliers.map((s) => (
            <SupplierRow
              key={s.id}
              s={s}
              onReorder={
                <form action={createReorderPOAction} className="inline">
                  <input type="hidden" name="supplierId" value={s.id} />
                  <button className="text-sm text-[var(--accent)] hover:underline">Auto-reorder</button>
                </form>
              }
            />
          ))}
        </tbody>
      </Table>

      <h2 className="mb-4 mt-10 text-xl font-semibold">Purchase orders</h2>
      {pos.length === 0 ? (
        <div className="glass rounded-[var(--radius)] p-8 text-center text-muted">No purchase orders yet.</div>
      ) : (
        <Table>
          <THead>
            <TR><TH>PO</TH><TH>Supplier</TH><TH>Items</TH><TH>Status</TH><TH>Created</TH></TR>
          </THead>
          <tbody>
            {pos.map((po) => (
              <TR key={po.id}>
                <TD className="font-mono text-xs">{po.id.slice(-8)}</TD>
                <TD>{po.supplier.name}</TD>
                <TD>{po._count.items}</TD>
                <TD><StatusBadge status={po.status === "RECEIVED" ? "PAID" : po.status === "CANCELLED" ? "CANCELLED" : "PENDING"} /></TD>
                <TD className="text-xs text-muted">{new Date(po.createdAt).toLocaleDateString()}</TD>
              </TR>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
