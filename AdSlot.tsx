"use client";

import { useEffect } from "react";

type AdSlotProps = {
  placement: "landing-top" | "landing-middle" | "landing-bottom" | "content-middle";
  className?: string;
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/** Reserved ad inventory. It stays completely out of the editor and PDF/print flow. */
export default function AdSlot({ placement, className = "" }: AdSlotProps) {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;
  const slot = process.env[`NEXT_PUBLIC_ADSENSE_SLOT_${placement.replaceAll("-", "_").toUpperCase()}`];
  if (!publisherId || !slot) return null;

  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense can be blocked by privacy tools or an ad blocker; the page must remain usable.
    }
  }, []);

  return (
    <div className={`ad-slot ad-slot-${placement} ${className}`} data-ad-placement={placement} aria-label="Publicidad">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={publisherId}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
