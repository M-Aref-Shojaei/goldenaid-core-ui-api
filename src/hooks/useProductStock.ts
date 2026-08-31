"use client";

import { useCallback, useEffect, useState } from "react";
import { adminGetStockItems } from "../api/inventory";
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

  return { items, loading, error, reload };
}
