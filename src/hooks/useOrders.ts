"use client";


import { useCallback, useEffect, useState } from "react";
import { getAdminOrders } from "../api/admin";
import type { AdminOrder } from "../types/admin";

/**
 * Normalises whatever `/admin/orders` returns into a plain array.
 *
 * The endpoint answers `{ orders, total }`. This previously looked only for
 * `items`, so it silently fell back to `[]` on every call and every order
 * disappeared from the admin panel -- the orders page and the POS sales
 * history both rendered their empty state while the API was returning data.
 * `items` and the bare-array form are still accepted so older or paginated
 * shapes keep working.
 */
function unwrapOrders(data: unknown): AdminOrder[] {
  if (Array.isArray(data)) return data as AdminOrder[];
  if (data && typeof data === "object") {
    const record = data as { orders?: unknown; items?: unknown };
    if (Array.isArray(record.orders)) return record.orders as AdminOrder[];
    if (Array.isArray(record.items)) return record.items as AdminOrder[];
  }
  return [];
}

/** Fetches all orders for the admin orders page. */
export function useOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setOrders(unwrapOrders(await getAdminOrders()));
    } catch { setOrders([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return { orders, loading, reload };
}
