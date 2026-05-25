"use client";

import Image from "next/image";
import { useState } from "react";
import { cn, productImage } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const gallery = images.length > 0 ? images : [undefined];
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {/* Thumbnails */}
      {gallery.length > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto sm:flex-col">
          {gallery.slice(0, 8).map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-surface-sunken transition-colors sm:h-20 sm:w-20",
                active === i ? "border-leaf-500" : "border-transparent",
              )}
            >
              <Image
                src={productImage(img, "thumb")}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="relative aspect-[3/4] flex-1 overflow-hidden rounded-[var(--radius-card)] bg-surface-sunken shadow-[var(--shadow-soft)]">
        <Image
          src={productImage(gallery[active], "full")}
          alt={name}
          fill
          priority
          sizes="(max-width:1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
