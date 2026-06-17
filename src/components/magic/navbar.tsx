"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion } from "motion/react";
import { ShoppingBag, Search, Home, Grid3x3, User, Heart, Menu } from "lucide-react";
import { useWishlist } from "@/stores/wishlist";
import { useTranslations } from "next-intl";
import { useCart } from "@/stores/cart";
import { useMounted } from "@/lib/use-mounted";
import { CurrencySwitcher } from "./currency-switcher";
import { cn } from "@/lib/utils";

export function Navbar({ logoUrl, storeName }: { logoUrl?: string; storeName?: string }) {
  const logo = logoUrl ?? "/logo.png";
  const name = storeName ?? "ASPORTS ZONE";
  const pathname = usePathname();
  const mounted = useMounted();
  const count = useCart((s) => s.count());
  const openCart = useCart((s) => s.open);
  const wishlistCount = useWishlist((s) => s.items.length);
  const { data: session } = useSession();
  const t = useTranslations("nav");

  const NAV = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/catalog", label: t("shop"), icon: Grid3x3 },
    { href: "/wishlist", label: "Saved", icon: Heart },
    { href: "/account", label: t("account"), icon: User },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 px-4 pt-4">
        <nav className="glass mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <Image src={logo} alt={name} width={56} height={56} className="h-14 w-14 shrink-0 rounded-lg" priority />
            <span className="hidden sm:block text-base font-bold tracking-tight">{name}</span>
            <span className="sr-only">{name} home</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm transition-colors",
                    active ? "text-foreground" : "text-muted hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <div className="mr-1 hidden sm:flex sm:items-center sm:gap-1">
              <CurrencySwitcher />
            </div>
            <Link
              href="/catalog"
              aria-label={t("search")}
              className="grid h-10 w-10 place-items-center rounded-full text-muted transition-colors hover:bg-[var(--surface-2)] hover:text-foreground"
            >
              <Search className="h-5 w-5" />
            </Link>

            <Link
              href="/wishlist"
              aria-label={`Wishlist (${mounted ? wishlistCount : 0})`}
              className="relative grid h-10 w-10 place-items-center rounded-full text-muted transition-colors hover:bg-[var(--surface-2)] hover:text-foreground"
            >
              <Heart className="h-5 w-5" />
              {mounted && wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--danger)] px-1 text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={openCart}
              aria-label={`${t("cart")} (${mounted ? count : 0})`}
              className="relative grid h-10 w-10 place-items-center rounded-full text-muted transition-colors hover:bg-[var(--surface-2)] hover:text-foreground"
            >
              <ShoppingBag className="h-5 w-5" />
              {mounted && count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold text-[#06070d]"
                >
                  {count}
                </motion.span>
              )}
            </button>

            {session?.user ? (
              <button
                onClick={() => signOut()}
                className="hidden rounded-full border border-[var(--border)] px-4 py-2 text-sm text-muted transition-colors hover:text-foreground sm:block"
              >
                {t("signOut")}
              </button>
            ) : (
              <Link
                href="/sign-in"
                className="hidden rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-4 py-2 text-sm font-semibold text-[#06070d] sm:block"
              >
                {t("signIn")}
              </Link>
            )}
            <Menu className="h-5 w-5 text-muted md:hidden" />
          </div>
        </nav>
      </header>

      {/* Mobile bottom nav */}
      <nav className="glass fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-2xl py-2 md:hidden">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-4 py-1 text-[10px]",
                active ? "text-[var(--accent)]" : "text-muted",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={openCart}
          className="relative flex flex-col items-center gap-0.5 px-4 py-1 text-[10px] text-muted"
        >
          <ShoppingBag className="h-5 w-5" />
          {t("cart")}
          {mounted && count > 0 && (
            <span className="absolute right-2 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--accent)] px-1 text-[9px] font-bold text-[#06070d]">
              {count}
            </span>
          )}
        </button>
      </nav>
    </>
  );
}
