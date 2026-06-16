import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listCategoriesAdmin } from "@/server/services/admin";
import { createProductAction } from "@/server/actions/admin";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "New product · Admin", robots: { index: false } };

export default async function NewProductPage() {
  const categories = await listCategoriesAdmin();
  return (
    <div>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <h1 className="mb-6 text-3xl font-bold tracking-tight">New product</h1>
      <ProductForm action={createProductAction} categories={categories} submitLabel="Create product" />
    </div>
  );
}
