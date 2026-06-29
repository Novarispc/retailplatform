export const dynamic = "force-dynamic";
import { Settings, Palette, Star } from "lucide-react";
import { getStoreProfile, getThemeColors, getLoyaltySettings } from "@/server/services/store";
import { StoreSettingsForm } from "./store-settings-form";
import { ThemeColorsForm } from "./theme-colors-form";
import { LoyaltySettingsForm } from "./loyalty-settings-form";

export const metadata = { title: "Store Settings · Admin", robots: { index: false } };

export default async function SettingsPage() {
  const [profile, themeColors, loyaltySettings] = await Promise.all([
    getStoreProfile(),
    getThemeColors(),
    getLoyaltySettings(),
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

      {/* Loyalty program */}
      <div>
        <h2 className="mb-1 flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Star className="h-6 w-6 text-[var(--accent)]" /> Loyalty Program
        </h2>
        <p className="mb-6 text-muted">
          Customize the points program name, earn rate, and description shown to customers.
        </p>
        <LoyaltySettingsForm initial={loyaltySettings} />
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
