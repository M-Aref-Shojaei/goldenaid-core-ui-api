"use client";

import { useEffect, useState } from "react";
import { getCampaigns } from "../api/admin";
import { ApiError, getErrorMessage } from "../api/client";
import type { CampaignSummary } from "../types/admin";

function normalize(c: Record<string, unknown>): CampaignSummary {
  return {
    id: String(c.id ?? ""),
    name: String(c.name ?? ""),
    status: (c.status as CampaignSummary["status"]) ?? "DRAFT",
    total_count: Number(c.total_count ?? 0),
    sent_count: Number(c.sent_count ?? 0),
    failed_count: Number(c.failed_count ?? 0),
    created_at: String(c.created_at ?? ""),
    sent_at: c.sent_at ? String(c.sent_at) : null,
  };
}

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function reload() {
    setLoading(true);
    setError("");
    try {
      const raw = (await getCampaigns()) as Record<string, unknown>[];
      setCampaigns(raw.map(normalize));
    } catch (e) {
      setError(getErrorMessage(e as ApiError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { reload(); }, []);

  return { campaigns, loading, error, reload };
}
