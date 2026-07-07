"use client";

import { useCallback, useEffect, useState } from "react";
import { getCampaign, getCampaignAnalytics, sendCampaign } from "../api/admin";
import { getErrorMessage, ApiError } from "../api/client";
import type { Campaign, CampaignAnalytics } from "../types/admin";

function normalizeCampaign(raw: unknown): Campaign {
  const r = raw as Record<string, unknown>;
  return {
    id: String(r.id ?? ""),
    name: String(r.name ?? ""),
    message_text: String(r.message_text ?? ""),
    status: (r.status as Campaign["status"]) ?? "DRAFT",
    total_count: Number(r.total_count ?? 0),
    sent_count: Number(r.sent_count ?? 0),
    failed_count: Number(r.failed_count ?? 0),
    created_at: String(r.created_at ?? ""),
    sent_at: r.sent_at ? String(r.sent_at) : null,
    recipients: (r.recipients as Campaign["recipients"]) ?? [],
  };
}

/**
 * Fetches a campaign by ID plus its delivery analytics, and provides a send action.
 *
 * Analytics are fetched only once the campaign has left DRAFT (i.e. after a
 * send attempt), since there is nothing to report before that.
 */
export function useCampaignDetail(id: string) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState("");

  const reload = useCallback(() => {
    setLoading(true);
    getCampaign(id)
      .then((raw) => {
        const normalized = normalizeCampaign(raw);
        setCampaign(normalized);
        if (normalized.status !== "DRAFT") {
          getCampaignAnalytics(id)
            .then(setAnalytics)
            .catch(() => setAnalytics(null));
        } else {
          setAnalytics(null);
        }
      })
      .catch(() => setCampaign(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { reload(); }, [reload]);

  const handleSend = useCallback(async () => {
    if (!campaign || campaign.status !== "DRAFT") return;
    setSending(true);
    setSendResult("");
    try {
      const res = await sendCampaign(id);
      setSendResult(`ارسال شد: ${res.sent} | ناموفق: ${res.failed}`);
      reload();
    } catch (e) {
      setSendResult(getErrorMessage(e as ApiError));
    } finally {
      setSending(false);
    }
  }, [campaign, id, reload]);

  return { campaign, analytics, loading, sending, sendResult, handleSend, reload };
}
