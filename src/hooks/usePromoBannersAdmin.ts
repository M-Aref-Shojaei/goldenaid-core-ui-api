"use client";

import { useCallback, useEffect, useState } from "react";
import {
  adminCreatePromoBanner,
  adminListPromoBanners,
  adminUpdatePromoBanner,
  adminDeletePromoBanner,
} from "../api/content";
import { getErrorMessage, ApiError } from "../api/client";
import type { PromoBannerSlot, UpdatePromoBannerSlotInput } from "../types/content";

/** Loads and manages every promo banner slot for the admin promotions page. */
export function usePromoBannersAdmin() {
  const [slots, setSlots] = useState<PromoBannerSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    adminListPromoBanners()
      .then(setSlots)
      .catch((e) => setError(getErrorMessage(e as ApiError)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createSlot = useCallback(async (data: UpdatePromoBannerSlotInput) => {
    const created = await adminCreatePromoBanner(data);
    setSlots((prev) => [...prev, created]);
    return created;
  }, []);

  const updateSlot = useCallback(async (id: string, data: UpdatePromoBannerSlotInput) => {
    const updated = await adminUpdatePromoBanner(id, data);
    setSlots((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  }, []);

  const toggleActive = useCallback(
    async (slot: PromoBannerSlot) => {
      await updateSlot(slot.id, {
        name: slot.name,
        image_url: slot.image_url,
        link_url: slot.link_url,
        is_active: !slot.is_active,
      });
    },
    [updateSlot],
  );

  const deleteSlot = useCallback(async (id: string) => {
    await adminDeletePromoBanner(id);
    setSlots((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return { slots, loading, error, reload: load, createSlot, updateSlot, toggleActive, deleteSlot };
}
