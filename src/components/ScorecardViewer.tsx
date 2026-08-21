"use client";

import { useState } from "react";
import Image from "next/image";
import type { ScorecardImage } from "@/lib/types";

export default function ScorecardViewer({ images }: { images: ScorecardImage[] }) {
  const [open, setOpen] = useState<ScorecardImage | null>(null);

  return (
    <>
      <div className="grid sm:grid-cols-2 gap-4">
        {images.map((img) => (
          <button
            key={img.src}
            onClick={() => setOpen(img)}
            className="text-left rounded-lg overflow-hidden border border-black/10 dark:border-white/15 hover:border-black/30 dark:hover:border-white/40 transition-colors cursor-zoom-in"
          >
            <Image
              src={img.src}
              alt={`${img.team} scorecard`}
              width={1100}
              height={850}
              className="w-full h-auto"
            />
            <div className="px-3 py-2 text-xs text-black/60 dark:text-white/60 border-t border-black/10 dark:border-white/15">
              {img.team} lineup ({img.side})
            </div>
          </button>
        ))}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setOpen(null)}
        >
          <Image
            src={open.src}
            alt={`${open.team} scorecard`}
            width={1600}
            height={1236}
            className="max-h-full w-auto h-auto rounded shadow-2xl"
          />
        </div>
      )}
    </>
  );
}
