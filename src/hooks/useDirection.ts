"use client";

import { useEffect, useState } from "react";

/** Text direction values this design system reasons about. */
export type Direction = "rtl" | "ltr";

/**
 * Reads the effective text direction for the current document.
 *
 * All apps in this monorepo render `<html dir="rtl">` by default (Persian
 * UI), so `"rtl"` is used as the SSR-safe default. On mount it re-reads
 * `document.documentElement.dir` so any app that later supports switching
 * to LTR content picks up the correct value without a full reload.
 *
 * @example
 * const dir = useDirection();
 * const ArrowIcon = dir === "rtl" ? ChevronLeft : ChevronRight;
 */
export function useDirection(): Direction {
  const [dir, setDir] = useState<Direction>("rtl");

  useEffect(() => {
    const attr = document.documentElement.dir;
    setDir(attr === "ltr" ? "ltr" : "rtl");
  }, []);

  return dir;
}
