"use client";

import { useMemo, useState } from "react";
import type { AdminOrder, FilterStatus, OrderFilters } from "../types/admin";

function filterOrders(orders: AdminOrder[], f: OrderFilters): AdminOrder[] {
  return orders.filter((order) => {
    if (f.searchQuery) {
      const q = f.searchQuery.toLowerCase();
      const matches =
        order.id.toLowerCase().includes(q) ||
        order.customer_phone?.toLowerCase().includes(q) ||
        order.customer_name?.toLowerCase().includes(q) ||
        order.customer_id.toLowerCase().includes(q);
      if (!matches) return false;
    }
    if (f.filterStatus !== "all" && order.status !== f.filterStatus) return false;
    if (f.minPrice && order.total_amount < parseInt(f.minPrice)) return false;
    if (f.maxPrice && order.total_amount > parseInt(f.maxPrice)) return false;
    if (f.startDate && new Date(order.created_at) < new Date(f.startDate)) return false;
    if (f.endDate) {
      const end = new Date(f.endDate);
      end.setHours(23, 59, 59, 999);
      if (new Date(order.created_at) > end) return false;
    }
    return true;
  });
}

/** Provides client-side filtering (search, status, price range, date range) over an admin orders array. */
export function useOrderFilters(orders: AdminOrder[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filters: OrderFilters = { searchQuery, filterStatus, minPrice, maxPrice, startDate, endDate };
  const filteredOrders = useMemo(() => filterOrders(orders, filters), [orders, searchQuery, filterStatus, minPrice, maxPrice, startDate, endDate]);

  const clearFilters = () => {
    setSearchQuery(""); setFilterStatus("all");
    setMinPrice(""); setMaxPrice("");
    setStartDate(""); setEndDate("");
  };

  const hasActiveFilters = Boolean(searchQuery || filterStatus !== "all" || minPrice || maxPrice || startDate || endDate);

  return { filters, setSearchQuery, setFilterStatus, setMinPrice, setMaxPrice, setStartDate, setEndDate, filteredOrders, clearFilters, hasActiveFilters };
}
