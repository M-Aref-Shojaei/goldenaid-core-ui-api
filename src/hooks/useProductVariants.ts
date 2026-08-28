"use client";

import { useCallback, useEffect, useState } from "react";
import { adminGetProduct, adminCreateVariant, adminUpdateVariant, adminDeleteVariant } from "../api/catalog";
import { getErrorMessage, ApiError } from "../api/client";
import type { ProductVariant } from "../types/catalog";

/** Loads and manages the variants (size/side/etc.) of a single admin product. */
export function useProductVariants(productId: string) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    adminGetProduct(productId)
      .then((product) => setVariants(product.variants ?? []))
      .catch((e) => setError(getErrorMessage(e as ApiError)))
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  const createVariant = useCallback(
    async (attributes: Record<string, string>, sortOrder = 0) => {
      const created = await adminCreateVariant(productId, { attributes, sort_order: sortOrder });
      setVariants((prev) => [...prev, created]);
      return created;
    },
    [productId],
  );

  const updateVariant = useCallback(
    async (variantId: string, data: Partial<{ attributes: Record<string, string>; sort_order: number }>) => {
      const updated = await adminUpdateVariant(productId, variantId, data);
      setVariants((prev) => prev.map((v) => (v.id === variantId ? updated : v)));
      return updated;
    },
    [productId],
  );

  const deleteVariant = useCallback(
    async (variantId: string) => {
      await adminDeleteVariant(productId, variantId);
      setVariants((prev) => prev.filter((v) => v.id !== variantId));
    },
    [productId],
  );

  return { variants, loading, error, createVariant, updateVariant, deleteVariant };
}
