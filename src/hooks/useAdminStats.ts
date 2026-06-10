"use client";

import { useEffect, useState } from "react";
import { getAdminStats } from "../api/admin";
import type { AdminStats } from "../types/admin";

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    setError("");
    getAdminStats()
      .then(setStats)
      .catch(() => setError("خطا در دریافت آمار"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  return { stats, error, loading, reload: load };
}
