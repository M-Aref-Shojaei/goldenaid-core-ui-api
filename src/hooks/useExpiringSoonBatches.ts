"use client";

import { useEffect, useState } from "react";
import { adminListExpiringSoonBatches } from "../api/inventory";
import type { ExpiringSoonBatch } from "../types/catalog";

/** Loads stock batches expiring within `days` days, for the admin low-stock/expiry dashboard. */
export function useExpiringSoonBatches(days = 30) {
  const [batches, setBatches] = useState<ExpiringSoonBatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminListExpiringSoonBatches(days)
      .then((res) => {
        if (!cancelled) setBatches(res);
      })
      .catch(() => {
        if (!cancelled) setBatches([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  return { batches, loading };
}
