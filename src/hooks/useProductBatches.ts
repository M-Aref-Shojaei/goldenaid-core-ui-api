"use client";

import { useCallback, useEffect, useState } from "react";
import { adminListBatches, adminCreateBatch, adminUpdateBatch, adminDeleteBatch } from "../api/inventory";
import { getErrorMessage, ApiError } from "../api/client";
import type { StockBatch } from "../types/catalog";

/** Loads and manages the stock batches of a single admin product. */
export function useProductBatches(productId: string) {
  const [batches, setBatches] = useState<StockBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    adminListBatches(productId)
      .then(setBatches)
      .catch((e) => setError(getErrorMessage(e as ApiError)))
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  const createBatch = useCallback(
    async (data: { variant_id?: string; quantity?: number; expiry_date?: string; code?: string }) => {
      const created = await adminCreateBatch({ product_id: productId, ...data });
      setBatches((prev) => [...prev, created]);
      return created;
    },
    [productId],
  );

  const updateBatch = useCallback(
    async (batchId: string, data: Partial<{ quantity: number; expiry_date: string; code: string }>) => {
      const updated = await adminUpdateBatch(batchId, data);
      setBatches((prev) => prev.map((b) => (b.id === batchId ? updated : b)));
      return updated;
    },
    [],
  );

  const deleteBatch = useCallback(async (batchId: string) => {
    await adminDeleteBatch(batchId);
    setBatches((prev) => prev.filter((b) => b.id !== batchId));
  }, []);

  return { batches, loading, error, createBatch, updateBatch, deleteBatch };
}
