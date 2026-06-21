export const dynamic = "force-dynamic";
import { Settings, Palette } from "lucide-react";
import { getStoreProfile, getThemeColors } from "@/server/services/store";
import { StoreSettingsForm } from "./store-settings-form";
import { ThemeColorsForm } from "./theme-colors-form";

export const metadata = { title: "Store Settings · Admin", robots: { index: false } };

export default async function SettingsPage() {
  const [profile, themeColors] = await Promise.all([
    getStoreProfile(),
    getThemeColors(),
  ]);
  return (
    <div className="space-y-12">
      {/* Store profile */}
      <div>
        <h1 className="mb-1 flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Settings className="h-7 w-7 text-[var(--accent)]" /> Store Settings
        </h1>
        <p className="mb-6 text-muted">Logo, name, address, social links, and footer details.</p>
        <StoreSettingsForm initial={profile} />
      </div>

      <hr className="border-[var(--border)]" />

      {/* Theme colors */}
      <div>
        <h2 className="mb-1 flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Palette className="h-6 w-6 text-[var(--accent)]" /> Theme Colors
        </h2>
        <p className="mb-6 text-muted">
          Customize the entire color palette. Changes apply instantly site-wide.
          Pick a preset or fine-tune each color individually.
        </p>
        <ThemeColorsForm initial={themeColors} />
      </div>
    </div>
  );
}
