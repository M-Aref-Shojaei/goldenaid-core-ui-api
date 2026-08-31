"use client";


import { useEffect, useState } from "react";
import { getRecentActivity } from "../api/admin";
import type { RecentActivityItem } from "../types/admin";

/** Fetches the most recent admin-relevant activity events (product updates, new orders). */
export function useRecentActivity(limit = 10) {
  const [items, setItems] = useState<RecentActivityItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    setError("");
    getRecentActivity(limit)
      .then((res) => setItems(res.items))
      .catch(() => setError("خطا در دریافت فعالیت‌های اخیر"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  return { items, error, loading, reload: load };
}
