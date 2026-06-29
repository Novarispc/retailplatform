import Link from "next/link";
import { MapPin, Mail, Phone, ShieldCheck, Truck, Award } from "lucide-react";
import { getStoreProfile } from "@/server/services/store";

export const metadata = { title: "About us" };

const VALUES = [
  { icon: Award, title: "Trusted brands", body: "Curated gear from 360, BDM, DSC, EM, GOWIN and Black Panther — no knock-offs." },
  { icon: Truck, title: "Fast dispatch", body: "Orders ship from our Jodhpur store with tracking on every parcel." },
  { icon: ShieldCheck, title: "Genuine & guaranteed", body: "Every product is authentic, quality-checked, and backed by our support team." },
];

export default async function AboutPage() {
  const profile = await getStoreProfile();
  const storeName    = profile.storeName    ?? "ASPORTS ZONE";
  const address      = profile.address      ?? "119, IInd B Road, Sardarpura, Jodhpur, Rajasthan 342003";
  const email        = profile.email        ?? "asportszone@gmail.com";
  const phone        = profile.phone;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight gradient-text">About {storeName}</h1>
      <p className="mt-4 max-w-2xl text-muted">
        From local nets to big matches, {storeName} has equipped players across Rajasthan with
        cricket bats, shoes, protective gear and full kits. We believe great gear should be
        accessible — so we stock trusted brands at fair prices, and stand behind every sale.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {VALUES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="glass rounded-[var(--radius)] p-6">
            <Icon className="mb-3 h-6 w-6 text-[var(--accent)]" />
            <h2 className="mb-1 text-sm font-semibold">{title}</h2>
            <p className="text-xs text-muted">{body}</p>
          </div>
        ))}
      </div>

      <div className="glass mt-10 rounded-[var(--radius)] p-6">
        <h2 className="mb-4 text-lg font-semibold">Visit or reach us</h2>
        <ul className="space-y-3 text-sm text-muted">
          <li className="flex items-center gap-2.5">
            <MapPin className="h-4 w-4 shrink-0 text-[var(--accent)]" /> {address}
          </li>
          <li className="flex items-center gap-2.5">
            <Mail className="h-4 w-4 shrink-0 text-[var(--accent)]" />
            <a href={`mailto:${email}`} className="hover:text-foreground">{email}</a>
          </li>
          {phone && (
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-[var(--accent)]" />
              <a href={`tel:${phone}`} className="hover:text-foreground">{phone}</a>
            </li>
          )}
        </ul>
      </div>

      <div className="mt-10">
        <Link href="/catalog" className="text-[var(--accent)] hover:underline">Browse the catalog →</Link>
      </div>
    </div>
  );
}
