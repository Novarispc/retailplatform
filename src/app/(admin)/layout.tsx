import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { AdminSidebar } from "@/components/admin/sidebar";
import { getStoreProfile } from "@/server/services/store";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in?from=/admin");
  if (!can(session.user.role, "admin.access")) redirect("/");

  const profile = await getStoreProfile();

  return (
    <div className="aurora-bg min-h-screen flex flex-col">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 lg:flex-row">
        <AdminSidebar logoUrl={profile.logoUrl} storeName={profile.storeName} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <footer className="border-t border-white/10 px-6 py-4 text-center text-xs text-white/40">
        <span className="font-medium text-white/60">Application Support — Nova Technology AB</span>
        <span className="mx-2 text-white/20">·</span>
        <a href="https://www.instagram.com/novarispc/" target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition-colors">Instagram</a>
        <span className="mx-2 text-white/20">·</span>
        <a href="tel:+46702528586" className="hover:text-white/70 transition-colors">+46 702 528 586</a>
        <span className="mx-2 text-white/20">·</span>
        <a href="tel:+918667681262" className="hover:text-white/70 transition-colors">+91 86676 81262</a>
      </footer>
    </div>
  );
}
