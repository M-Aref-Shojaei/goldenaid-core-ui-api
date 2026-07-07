"use client";

import { useEffect, useState } from "react";
import { getHeroBanner } from "../api/content";
import type { HeroBanner } from "../types/content";

/** Loads the current storefront hero banner content for the home page (public). */
export function useHeroBanner() {
  const [banner, setBanner] = useState<HeroBanner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHeroBanner()
      .then(setBanner)
      .catch(() => setBanner(null))
      .finally(() => setLoading(false));
  }, []);

  return { banner, loading };
}
