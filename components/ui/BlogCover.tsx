"use client";

import Image from "next/image";
import { useState } from "react";
import { SITE_IMAGES } from "@/lib/section-images";

const FALLBACK = SITE_IMAGES.fallbackEmpty;

/** Client cover with broken-URL fallback for blog detail heroes. */
export function BlogCover({
  src,
  alt,
  priority = false,
  className = "object-cover",
}: {
  src: string | null | undefined;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  const initial = src?.trim() || FALLBACK;
  const [current, setCurrent] = useState(initial);

  return (
    <Image
      src={current}
      alt={alt}
      fill
      className={className}
      priority={priority}
      sizes="(max-width: 896px) 100vw, 896px"
      onError={() => setCurrent((prev) => (prev === FALLBACK ? prev : FALLBACK))}
    />
  );
}
