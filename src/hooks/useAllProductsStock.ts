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
  /**
   * online_allocated_qty keyed by variant_id, for products that have
   * variants. `null` means "use the 80% default" for that variant.
   */
  onlineAllocatedQtyByVariant: Record<string, number | null>;
  /** effective_online_qty keyed by variant_id, for products that have variants. */
  effectiveOnlineQtyByVariant: Record<string, number>;
  /**
   * online_allocated_qty for the product's own (no-variant) row, if it has
   * one — i.e. products without variants. `undefined` when every row for
   * this product has a variant_id.
   */
  onlineAllocatedQty: number | null | undefined;
  /** effective_online_qty for the product's own (no-variant) row; see `onlineAllocatedQty`. */
  effectiveOnlineQty: number | undefined;
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
        onlineAllocatedQtyByVariant: {},
        effectiveOnlineQtyByVariant: {},
        onlineAllocatedQty: undefined,
        effectiveOnlineQty: undefined,
      };
      entry.total += item.available_qty;
      if (item.variant_id !== null) {
        entry.byVariant[item.variant_id] = item.available_qty;
        entry.onlineAllocatedQtyByVariant[item.variant_id] = item.online_allocated_qty;
        entry.effectiveOnlineQtyByVariant[item.variant_id] = item.effective_online_qty;
      } else {
        entry.onlineAllocatedQty = item.online_allocated_qty;
        entry.effectiveOnlineQty = item.effective_online_qty;
      }
      map[item.product_id] = entry;
    }
    return map;
  }, [items]);

  return { stockByProduct, loading, error, reload };
}
