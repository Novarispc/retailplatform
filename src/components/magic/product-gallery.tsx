"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
}: {
  images: { url: string; alt: string | null }[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const list = images.length ? images : [{ url: "", alt: name }];

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row">
      <div className={cn("gap-3 sm:flex-col", images.length > 1 ? "flex" : "hidden")}>
        {list.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`View image ${i + 1}`}
            className={cn(
              "relative h-16 w-16 overflow-hidden rounded-xl border transition-colors",
              i === active ? "border-[var(--accent)]" : "border-[var(--border)]",
            )}
          >
            {img.url && <Image src={img.url} alt={img.alt ?? name} fill className="object-cover" sizes="64px" />}
          </button>
        ))}
      </div>

      <div className="relative aspect-square flex-1 overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-2)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            {list[active].url ? (
              <Image
                src={list[active].url}
                alt={list[active].alt ?? name}
                fill
                priority
                sizes="(max-width:768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted">
                <ImageOff className="h-10 w-10" />
                <span className="text-sm">Image coming soon</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
