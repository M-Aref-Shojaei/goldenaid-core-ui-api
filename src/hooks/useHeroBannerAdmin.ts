"use client";

import { useCallback, useEffect, useState } from "react";
import { adminGetHeroBanner, adminUpdateHeroBanner } from "../api/content";
import { getErrorMessage, ApiError } from "../api/client";
import type { UpdateHeroBannerInput } from "../types/content";

/** Editable form state for the admin hero banner editor. */
export interface HeroBannerForm {
  headline: string;
  description: string;
  cta_text: string;
  cta_link: string;
  target_product_id: string;
  image_url: string;
}

const EMPTY_FORM: HeroBannerForm = {
  headline: "",
  description: "",
  cta_text: "",
  cta_link: "",
  target_product_id: "",
  image_url: "",
};

/** Loads and saves the storefront home page hero banner (admin only). */
export function useHeroBannerAdmin() {
  const [form, setFormState] = useState<HeroBannerForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    adminGetHeroBanner()
      .then((banner) =>
        setFormState({
          headline: banner.headline,
          description: banner.description,
          cta_text: banner.cta_text ?? "",
          cta_link: banner.cta_link ?? "",
          target_product_id: banner.target_product_id ?? "",
          image_url: banner.image_url ?? "",
        }),
      )
      .catch((e) => setError(getErrorMessage(e as ApiError)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setField = <K extends keyof HeroBannerForm>(key: K, value: HeroBannerForm[K]) =>
    setFormState((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const payload: UpdateHeroBannerInput = {
        headline: form.headline,
        description: form.description,
        cta_text: form.cta_text || null,
        cta_link: form.cta_link || null,
        target_product_id: form.target_product_id || null,
        image_url: form.image_url || null,
      };
      await adminUpdateHeroBanner(payload);
      setSuccess(true);
    } catch (e) {
      setError(getErrorMessage(e as ApiError));
    } finally {
      setSaving(false);
    }
  };

  return { form, setField, loading, saving, error, success, save };
}
