"use client";

import { useEffect, useState } from "react";
import { listMyOrders } from "../api/orders";
import { useAuth } from "../providers/AuthProvider";
import type { Order } from "../types/orders";

export interface UseMyOrdersResult {
  isAuthenticated: boolean;
  orders: Order[];
  loading: boolean;
}

export function useMyOrders(): UseMyOrdersResult {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    let active = true;
    setLoading(true);
    listMyOrders()
      .then((data) => {
        if (!active) return;
        const items = Array.isArray(data) ? data : (data as { items?: Order[] }).items || [];
        setOrders(items);
      })
      .catch(() => { if (active) setOrders([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isAuthenticated]);

  return { isAuthenticated, orders, loading };
}
