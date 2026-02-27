"use client";

import { CSSProperties, useEffect } from "react";

import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

interface AdSlotProps {
  slotId: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  style?: CSSProperties;
  className?: string;
}

export function AdSlot({ slotId, format = "auto", style, className }: AdSlotProps) {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const shouldRenderRealAds = process.env.NODE_ENV === "production" && !!adsenseClient;

  useEffect(() => {
    if (!shouldRenderRealAds) {
      return;
    }

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // Ignore noisy adblock/runtime script errors.
    }
  }, [shouldRenderRealAds, slotId]);

  if (!shouldRenderRealAds) {
    return (
      <div
        className={cn(
          "flex h-24 w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 text-xs tracking-[0.2em] text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400",
          className,
        )}
        style={style}
      >
        AD SLOT {slotId}
      </div>
    );
  }

  return (
    <ins
      className={cn("adsbygoogle block overflow-hidden rounded-xl", className)}
      style={{ display: "block", ...(style || {}) }}
      data-ad-client={adsenseClient}
      data-ad-slot={slotId}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
