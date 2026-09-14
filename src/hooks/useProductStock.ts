"use client";

import { useCallback, useEffect, useState } from "react";
import { adminGetStockItems, adminSetOnlineAllocation } from "../api/inventory";
import { getErrorMessage, ApiError } from "../api/client";
import type { StockItem } from "../types/catalog";

/** Loads the current available stock (one row per variant) for a product. */
export function useProductStock(productId: string) {
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await adminGetStockItems(productId));
    } catch (e) {
      setError(getErrorMessage(e as ApiError));
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    reload();
  }, [reload]);

  /**
   * Sets (or, passing `null`, clears back to the 80% default) the online
   * allocation for one (product, variant) row, updating that row in `items`
   * in place with the server's response.
   */
  const setOnlineAllocation = useCallback(
    async (variantId: string | null, onlineAllocatedQty: number | null) => {
      const updated = await adminSetOnlineAllocation({
        product_id: productId,
        variant_id: variantId,
        online_allocated_qty: onlineAllocatedQty,
      });
      setItems((prev) =>
        prev.map((item) => (item.variant_id === variantId ? updated : item)),
      );
      return updated;
    },
    [productId],
  );

  return { items, loading, error, reload, setOnlineAllocation };
}
