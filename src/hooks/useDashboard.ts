"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listMyOrders } from "../api/orders";
import { useAuth } from "../providers/AuthProvider";
import type { Order } from "../types/orders";

/** Tabs available in the customer dashboard. */
export type ActiveTab = "dashboard" | "profile" | "orders" | "transactions" | "addresses" | "favorites" | "reviews";

/** Aggregates auth state, orders, and tab management for the customer dashboard. */
export function useDashboard() {
  const router = useRouter();
  const { isAuthenticated, phone, userName, userId, isAdmin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.push("/auth/login");
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    setOrdersLoading(true);
    listMyOrders()
      .then((data) => {
        if (!active) return;
        const items = Array.isArray(data) ? data : (data as { items?: Order[] }).items || [];
        setOrders(items);
      })
      .catch(() => { if (active) setOrders([]); })
      .finally(() => { if (active) setOrdersLoading(false); });
    return () => { active = false; };
  }, [isAuthenticated]);

  const handleLogout = () => { logout(); router.push("/"); };
  const goToAdmin = () => router.push("/admin");

  return { isAuthenticated, phone, userName, userId, isAdmin, activeTab, setActiveTab, orders, ordersLoading, handleLogout, goToAdmin };
}
