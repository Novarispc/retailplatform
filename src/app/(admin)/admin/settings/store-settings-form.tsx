"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { updateStoreProfileAction } from "@/server/actions/store";
import type { StoreProfile } from "@/server/services/store";

const INPUT_CLS =
  "mt-2 h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm focus:border-[var(--accent)] focus:outline-none";

export function StoreSettingsForm({ initial }: { initial: StoreProfile }) {
  const [state, action, pending] = useActionState(updateStoreProfileAction, {
    ok: false,
  } as { ok?: boolean; error?: string });

  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const MAX_LOGO_BYTES = 8 * 1024 * 1024; // keep in sync with next.config bodySizeLimit

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_LOGO_BYTES) {
      setFileError("Logo is larger than 8 MB. Please choose a smaller image.");
      e.target.value = "";
      setPreview(null);
      return;
    }
    setPreview(URL.createObjectURL(file));
  }

  const currentLogo = preview ?? initial.logoUrl ?? "/logo.png";

  return (
    <form action={action} encType="multipart/form-data" className="space-y-6">

      {/* ── Logo ── */}
      <div className="glass rounded-2xl p-6">
        <h2 className="mb-4 text-lg font-semibold">Logo</h2>
        <div className="flex items-center gap-5">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]">
            <Image src={currentLogo} alt="Logo preview" fill className="object-contain p-1" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-muted mb-1">Upload new logo</label>
            <input
              ref={fileRef}
              name="logoFile"
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={handleLogoChange}
              className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--surface-2)] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-foreground hover:file:bg-[var(--surface)]"
            />
            <p className="mt-1 text-xs text-muted">PNG, JPG, SVG or WebP, up to 8 MB. Leave blank to keep current logo.</p>
            {fileError && <p className="mt-1 text-xs text-[var(--danger)]">{fileError}</p>}
          </div>
        </div>
      </div>

      {/* ── Store info ── */}
      <div className="glass rounded-2xl p-6">
        <h2 className="mb-4 text-lg font-semibold">Store information</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <Label htmlFor="storeName">Store name</Label>
            <input id="storeName" name="storeName" defaultValue={initial.storeName ?? "ASPORTS ZONE"} className={INPUT_CLS} placeholder="ASPORTS ZONE" />
          </div>
          <div>
            <Label htmlFor="email">Contact email</Label>
            <input id="email" name="email" type="email" defaultValue={initial.email ?? ""} className={INPUT_CLS} placeholder="asportszone@gmail.com" />
          </div>
          <div>
            <Label htmlFor="phone">Phone number</Label>
            <input id="phone" name="phone" defaultValue={initial.phone ?? ""} className={INPUT_CLS} placeholder="+91 98765 43210" />
          </div>
          <div>
            <Label htmlFor="googleMapsUrl">Google Maps link</Label>
            <input id="googleMapsUrl" name="googleMapsUrl" defaultValue={initial.googleMapsUrl ?? ""} className={INPUT_CLS} placeholder="https://maps.google.com/?q=..." />
          </div>
        </div>
        <div className="mt-4">
          <Label htmlFor="address">Full address</Label>
          <textarea
            id="address"
            name="address"
            defaultValue={initial.address ?? ""}
            rows={2}
            className="mt-2 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
            placeholder="119, IInd B Road, Sardarpura, Jodhpur, Rajasthan 342003"
          />
        </div>
      </div>

      {/* ── Social links ── */}
      <div className="glass rounded-2xl p-6">
        <h2 className="mb-4 text-lg font-semibold">Social media links</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <Label htmlFor="instagramUrl">Instagram URL</Label>
            <input id="instagramUrl" name="instagramUrl" defaultValue={initial.instagramUrl ?? ""} className={INPUT_CLS} placeholder="https://instagram.com/asportszone/" />
          </div>
          <div>
            <Label htmlFor="facebookUrl">Facebook URL</Label>
            <input id="facebookUrl" name="facebookUrl" defaultValue={initial.facebookUrl ?? ""} className={INPUT_CLS} placeholder="https://facebook.com/asportszone" />
          </div>
          <div>
            <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
            <input id="linkedinUrl" name="linkedinUrl" defaultValue={initial.linkedinUrl ?? ""} className={INPUT_CLS} placeholder="https://linkedin.com/company/asportszone" />
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="glass rounded-2xl p-6">
        <h2 className="mb-4 text-lg font-semibold">Footer details</h2>
        <p className="mb-4 text-sm text-muted">Shown in the bottom section of every page. Leave blank to use store name / address above.</p>
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <Label htmlFor="footerName">Footer business name</Label>
            <input id="footerName" name="footerName" defaultValue={initial.footerName ?? ""} className={INPUT_CLS} placeholder="ASPORTS ZONE" />
          </div>
          <div>
            <Label htmlFor="footerAddress">Footer address line</Label>
            <input id="footerAddress" name="footerAddress" defaultValue={initial.footerAddress ?? ""} className={INPUT_CLS} placeholder="119, IInd B Road, Sardarpura, Jodhpur" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save settings"}</Button>
        {state?.error && <p className="text-sm text-[var(--danger)]">{state.error}</p>}
        {state?.ok && <p className="text-sm text-success">Settings saved.</p>}
      </div>
    </form>
  );
}
