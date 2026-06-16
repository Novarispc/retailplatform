import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { MapPin, Phone, Mail } from "lucide-react";
import { auth } from "@/lib/auth";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h3v6h3v-6h2.5l.5-3H13v-2c0-.6.4-1 1-1z" />
    </svg>
  );
}

const SHOP_LINKS: [string, string][] = [
  ["All products", "/catalog"],
  ["Cricket bats", "/catalog?category=accessories"],
  ["Shoes", "/catalog?category=cricket-shoes"],
  ["Combos & kits", "/catalog"],
];

const COMPANY_LINKS: [string, string][] = [
  ["About us", "#about"],
  ["Track order", "/account"],
  ["Privacy policy", "#"],
];

const BRANDS = ["SS TON", "SG", "New Balance", "Gray Nicolls", "RNS", "TYKA", "Asics"];

export async function Footer() {
  const t = await getTranslations("footer");
  const session = await auth();
  const signedIn = !!session?.user;

  const accountLinks: [string, string][] = signedIn
    ? [
        ["My account", "/account"],
        ["My orders", "/account"],
        ["Wishlist", "/wishlist"],
      ]
    : [
        ["Sign in", "/sign-in"],
        ["Create account", "/sign-up"],
        ["Track order", "/account"],
      ];

  return (
    <footer className="mt-24 border-t border-[var(--border)] px-6 py-14">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-5">
        {/* brand + contact */}
        <div className="lg:col-span-2">
          <Link href="/" className="mb-4 flex items-center gap-2.5 font-semibold">
            <Image src="/logo.png" alt="A Sports Zone" width={48} height={48} className="h-12 w-12 rounded-lg" />
            <span className="text-lg">A<span className="text-muted"> Sports Zone</span></span>
          </Link>
          <p className="mb-5 max-w-xs text-sm text-muted">{t("tagline")}</p>
          <ul className="space-y-2.5 text-sm text-muted">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
              119, IInd B Road, Sardarpura, Jodhpur, Rajasthan 342003
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-[var(--accent)]" />
              <a href="mailto:asportszone@gmail.com" className="transition-colors hover:text-foreground">asportszone@gmail.com</a>
            </li>
          </ul>
          <div className="mt-5 flex gap-3">
            <a href="https://instagram.com/asportszone/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
              className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] text-muted transition-colors hover:border-[var(--accent)] hover:text-foreground">
              <InstagramIcon className="h-4 w-4" />
            </a>
            <a href="https://facebook.com/24.Sports.cricket" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
              className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] text-muted transition-colors hover:border-[var(--accent)] hover:text-foreground">
              <FacebookIcon className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">{t("shop")}</h4>
          <ul className="space-y-2">
            {SHOP_LINKS.map(([label, href]) => (
              <li key={label}>
                <Link href={href} className="text-sm text-muted transition-colors hover:text-foreground">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">{t("account")}</h4>
          <ul className="space-y-2">
            {accountLinks.map(([label, href]) => (
              <li key={label}>
                <Link href={href} className="text-sm text-muted transition-colors hover:text-foreground">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold">{t("company")}</h4>
          <ul className="space-y-2">
            {COMPANY_LINKS.map(([label, href]) => (
              <li key={label}>
                <Link href={href} className="text-sm text-muted transition-colors hover:text-foreground">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl flex-col gap-4 border-t border-[var(--border)] pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} A Sports Zone. {t("rights")}</span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {["360", "BDM", "DSC", "EM", "GOWIN", "Black Panther"].map((b) => <span key={b}>{b}</span>)}
        </span>
      </div>
    </footer>
  );
}
