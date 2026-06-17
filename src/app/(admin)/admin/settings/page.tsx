export const dynamic = "force-dynamic";
import { Settings } from "lucide-react";
import { getStoreProfile } from "@/server/services/store";
import { StoreSettingsForm } from "./store-settings-form";

export const metadata = { title: "Store Settings · Admin", robots: { index: false } };

export default async function SettingsPage() {
  const profile = await getStoreProfile();
  return (
    <div>
      <h1 className="mb-1 flex items-center gap-2 text-3xl font-bold tracking-tight">
        <Settings className="h-7 w-7 text-[var(--accent)]" /> Store Settings
      </h1>
      <p className="mb-6 text-muted">Logo, name, address, social links, and footer details.</p>
      <StoreSettingsForm initial={profile} />
    </div>
  );
}
