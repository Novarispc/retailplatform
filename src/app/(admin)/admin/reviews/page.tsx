import { Star, Trash2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getActiveTenant } from "@/lib/tenant";
import { deleteReviewAction } from "@/server/actions/admin";
import { Table, THead, TH, TR, TD } from "@/components/admin/table";

export const metadata = { title: "Reviews · Admin", robots: { index: false } };

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < rating ? "fill-[var(--accent)] text-[var(--accent)]" : "text-[var(--border)]"}`}
        />
      ))}
    </span>
  );
}

export default async function ReviewsPage() {
  const session = await auth();
  if (!session?.user || !can(session.user.role, "order.read")) redirect("/admin");

  const tenant = await getActiveTenant();
  const reviews = await prisma.review.findMany({
    where: { product: { tenantId: tenant.id } },
    include: {
      product: { select: { name: true, slug: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <h1 className="mb-1 text-3xl font-bold tracking-tight">Reviews</h1>
      <p className="mb-6 text-muted">{reviews.length} total</p>

      {reviews.length === 0 ? (
        <div className="glass rounded-[var(--radius)] p-10 text-center text-muted">No reviews yet.</div>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Product</TH>
              <TH>Customer</TH>
              <TH>Rating</TH>
              <TH>Title</TH>
              <TH>Body</TH>
              <TH>Date</TH>
              <TH className="text-right">Action</TH>
            </TR>
          </THead>
          <tbody>
            {reviews.map((r) => (
              <TR key={r.id}>
                <TD className="font-medium">{r.product.name}</TD>
                <TD className="text-muted">{r.user.name ?? r.user.email}</TD>
                <TD><Stars rating={r.rating} /></TD>
                <TD className="max-w-[140px] truncate text-sm">{r.title ?? "—"}</TD>
                <TD className="max-w-[200px] truncate text-sm text-muted">{r.body ?? "—"}</TD>
                <TD className="text-xs text-muted">{new Date(r.createdAt).toLocaleDateString()}</TD>
                <TD className="text-right">
                  <form action={deleteReviewAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="productId" value={r.productId} />
                    <button
                      aria-label="Delete review"
                      className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-[var(--surface-2)] hover:text-[var(--danger)]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
