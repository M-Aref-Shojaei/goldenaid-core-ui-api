"use client";

import { useEffect, useState } from "react";
import { getPromoBanners } from "../api/content";
import type { PromoBannerSlot } from "../types/content";

/** Loads the active promo banner slots for the storefront home page (public). */
export function usePromoBanners() {
  const [banners, setBanners] = useState<PromoBannerSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPromoBanners()
      .then(setBanners)
      .catch(() => setBanners([]))
      .finally(() => setLoading(false));
  }, []);

  return { banners, loading };
}
