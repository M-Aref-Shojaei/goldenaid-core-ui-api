"use client";

import React from "react";
import { useBackendHealth } from "../hooks/useBackendHealth";

/** Props for {@link MaintenanceGate}. */
export interface MaintenanceGateProps {
  /** Backend health-check URL (e.g. core-bff's `/health`). */
  healthUrl: string;
  /** How often to re-check while healthy or down, in ms. Defaults to 10s. */
  intervalMs?: number;
  children: React.ReactNode;
}

/**
 * Shows a full-page "under maintenance" message instead of the app while
 * the backend is unreachable (e.g. during a redeploy), and switches back
 * to `children` automatically as soon as it recovers — no reload needed.
 */
export function MaintenanceGate({ healthUrl, intervalMs, children }: MaintenanceGateProps) {
  const { isDown } = useBackendHealth(healthUrl, { intervalMs });

  if (!isDown) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-dark px-6 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent" />
      <p className="text-lg font-bold text-white">سایت در حال بروزرسانی است</p>
      <p className="max-w-sm text-sm text-neutral-400">
        لطفاً چند لحظه صبر کنید — به محض اتمام بروزرسانی، بازمی‌گردیم.
      </p>
    </div>
  );
}
