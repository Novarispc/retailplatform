"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Users, Store, Megaphone, TrendingUp, Truck, Star, LayoutTemplate, Film, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminModeToggle } from "./admin-mode-toggle";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/admin/marketing", label: "Marketing", icon: Megaphone },
  { href: "/admin/cms", label: "Content", icon: LayoutTemplate },
  { href: "/admin/suppliers", label: "Suppliers", icon: Truck },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/trust-wall", label: "Trust Wall", icon: Film },
  { href: "/admin/themes", label: "Cricket Themes", icon: Sparkles },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ logoUrl, storeName }: { logoUrl?: string; storeName?: string }) {
  const pathname = usePathname();
  const logo = logoUrl ?? "/logo.png";
  const name = storeName ?? "ASPORTS ZONE";
  return (
    <aside className="glass sticky top-4 h-fit w-full rounded-2xl p-3 lg:w-60">
      <div className="mb-4 flex items-center gap-2 px-2 py-2 font-semibold">
        <Image src={logo} alt={name} width={40} height={40} className="h-10 w-10 rounded-lg ring-1 ring-white/20" />
        <span className="hidden flex-1 sm:inline">Admin</span>
        <AdminModeToggle />
      </div>
      <nav className="flex gap-1 lg:flex-col">
        {LINKS.map((l) => {
          const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active ? "bg-[var(--surface-2)] text-foreground" : "text-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{l.label}</span>
            </Link>
          );
        })}
      </nav>
      <Link
        href="/"
        className="mt-4 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <Store className="h-4 w-4" />
        <span className="hidden sm:inline">View store</span>
      </Link>
    </aside>
  );
}
