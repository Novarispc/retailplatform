export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProductForEdit, listCategoriesAdmin } from "@/server/services/admin";
import { updateProductAction } from "@/server/actions/admin";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "Edit product · Admin", robots: { index: false } };

type Params = Promise<{ id: string }>;

export default async function EditProductPage({ params }: { params: Params }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getProductForEdit(id), listCategoriesAdmin()]);
  if (!product) notFound();

  const inv = product.variants[0]?.inventory;
  const action = updateProductAction.bind(null, id);

  return (
    <div>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Edit product</h1>
      <ProductForm
        action={action}
        categories={categories}
        submitLabel="Save changes"
        initial={{
          name: product.name,
          slug: product.slug,
          description: product.description,
          priceMajor: product.priceMinor / 100,
          categoryId: product.categoryId ?? "",
          featured: product.featured,
          active: product.active,
          imageUrl: product.images[0]?.url ?? "",
          stock: inv?.quantity ?? 0,
          specs: product.productSpecs.map((s) => ({ key: s.key, value: s.value })),
        }}
      />
    </div>
  );
}
