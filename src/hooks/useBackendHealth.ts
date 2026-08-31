"use client";

import { useEffect, useRef, useState } from "react";

const CONSECUTIVE_FAILURES_BEFORE_DOWN = 2;

/**
 * Polls `healthUrl` on an interval and reports whether the backend looks
 * down — used to show a maintenance page during a backend redeploy instead
 * of broken/blank pages. Requires two consecutive failures before flagging
 * down, so one transient blip doesn't trigger it; a single success clears
 * it immediately.
 */
export function useBackendHealth(
  healthUrl: string,
  { intervalMs = 10_000 }: { intervalMs?: number } = {},
) {
  const [isDown, setIsDown] = useState(false);
  const failureCount = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const res = await fetch(healthUrl);
        if (!res.ok) throw new Error(`unhealthy: ${res.status}`);
        failureCount.current = 0;
        if (!cancelled) setIsDown(false);
      } catch {
        failureCount.current += 1;
        if (!cancelled && failureCount.current >= CONSECUTIVE_FAILURES_BEFORE_DOWN) {
          setIsDown(true);
        }
      }
    };

    check();
    const id = setInterval(check, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [healthUrl, intervalMs]);

  return { isDown };
}
