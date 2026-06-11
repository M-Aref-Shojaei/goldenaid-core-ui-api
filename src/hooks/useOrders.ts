"use client";

import { useCallback, useEffect, useState } from "react";
import { getAdminOrders } from "../api/admin";
import type { AdminOrder } from "../types/admin";

/** Fetches all orders for the admin orders page. */
export function useOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await getAdminOrders()) as AdminOrder[];
      setOrders(Array.isArray(data) ? data : (data as { items?: AdminOrder[] }).items || []);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return { orders, loading, reload };
}
