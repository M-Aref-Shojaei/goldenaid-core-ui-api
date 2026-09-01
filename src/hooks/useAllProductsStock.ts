"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminGetAllStockItems } from "../api/inventory";
import { getErrorMessage, ApiError } from "../api/client";
import type { StockItem } from "../types/catalog";

/** Available stock for one product: the total, plus a per-variant breakdown. */
export interface ProductStockSummary {
  /** Sum of available_qty across every variant of the product. */
  total: number;
  /** available_qty keyed by variant_id, for products that have variants. */
  byVariant: Record<string, number>;
  /** Unit label to display (e.g. "عدد"); taken from the product's rows. */
  unitLabel: string;
}

/**
 * Loads current available stock for the whole catalogue in one request and
 * indexes it by product id.
 *
 * POS shows a count on every card as soon as the page opens, and its grid
 * holds the entire catalogue — so this deliberately does one bulk read rather
 * than one `useProductStock` call per card, which would be one HTTP request
 * per product on every load.
 *
 * A product with no stock rows is simply absent from the map; callers should
 * treat "missing" as zero rather than as "unknown".
 */
export function useAllProductsStock() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await adminGetAllStockItems());
    } catch (e) {
      setError(getErrorMessage(e as ApiError));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const stockByProduct = useMemo(() => {
    const map: Record<string, ProductStockSummary> = {};
    for (const item of items) {
      const entry = map[item.product_id] ?? {
        total: 0,
        byVariant: {},
        unitLabel: item.unit_label,
      };
      entry.total += item.available_qty;
      if (item.variant_id !== null) {
        entry.byVariant[item.variant_id] = item.available_qty;
      }
      map[item.product_id] = entry;
    }
    return map;
  }, [items]);

  return { stockByProduct, loading, error, reload };
}
