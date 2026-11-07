"use client";

import { useState } from "react";
import { parsePhotoList } from "@/lib/storage/upload";
import { SITE_IMAGES } from "@/lib/section-images";
import { cn } from "@/lib/utils";

type ListingGalleryProps = {
  photos?: unknown;
  videoUrl?: string | null;
  alt?: string;
  className?: string;
};

export function ListingGallery({ photos, videoUrl, alt = "Listing photo", className }: ListingGalleryProps) {
  const list = parsePhotoList(photos);
  const [active, setActive] = useState(0);

  if (!list.length && !videoUrl) {
    return (
      <div
        className={cn("aspect-[16/10] rounded-xl bg-stone-100 bg-cover bg-center", className)}
        style={{ backgroundImage: `url("${SITE_IMAGES.fallbackEmpty}")` }}
        role="img"
        aria-label={alt}
      />
    );
  }

  const mainSrc = list[active] ?? list[0];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-stone-100">
        {mainSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mainSrc}
            alt={alt}
            className="h-full w-full object-cover transition-opacity duration-300"
            onError={(e) => {
              const img = e.currentTarget;
              if (!img.src.includes("fallback-empty")) {
                img.src = SITE_IMAGES.fallbackEmpty;
              }
            }}
          />
        ) : videoUrl ? (
          <video src={videoUrl} controls className="h-full w-full object-cover" />
        ) : null}
        {list.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
            {active + 1} / {list.length}
          </span>
        )}
      </div>

      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {list.map((url, i) => (
            <button
              key={url + i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition",
                i === active ? "border-[var(--color-primary)]" : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {videoUrl && list.length > 0 && (
        <div className="overflow-hidden rounded-xl">
          <p className="mb-2 text-sm font-semibold text-stone-600">Video</p>
          <video src={videoUrl} controls className="w-full rounded-lg bg-black" />
        </div>
      )}
    </div>
  );
}
