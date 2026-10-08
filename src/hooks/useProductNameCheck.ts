"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { adminCheckProductName } from "../api/catalog";
import type { ProductNameMatch } from "../types/catalog";

/**
 * Duplicate-name guard for creating a product (ADMIN-PRODUCT-GROUPS.md §1):
 * checks `title` against every product (active, hidden, pending) `delayMs`
 * after typing stops, and `check(title)` runs immediately (call it on save).
 * The server folds the name (ي/ك, digits, ZWNJ, spacing, case) and repeats the
 * check on create (409 `DUPLICATE_NAME`). A response for a name that is no
 * longer the latest is ignored; a failed check fails open (no matches).
 */
export function useProductNameCheck(title: string, { excludeId, delayMs = 400 }: { excludeId?: string; delayMs?: number } = {}) {
  const [matches, setMatches] = useState<ProductNameMatch[]>([]);
  const [checking, setChecking] = useState(false);
  const latest = useRef(0);

  const check = useCallback(async (name: string): Promise<ProductNameMatch[]> => {
    const id = ++latest.current;
    if (!name.trim()) {
      setMatches([]);
      setChecking(false);
      return [];
    }
    setChecking(true);
    let found: ProductNameMatch[] = [];
    try {
      found = (await adminCheckProductName(name.trim(), excludeId)).matches ?? [];
    } catch {
      found = [];
    }
    if (id === latest.current) {
      setMatches(found);
      setChecking(false);
    }
    return found;
  }, [excludeId]);

  useEffect(() => {
    if (!title.trim()) {
      latest.current++;
      setMatches([]);
      setChecking(false);
      return;
    }
    const t = setTimeout(() => { void check(title); }, delayMs);
    return () => clearTimeout(t);
  }, [title, delayMs, check]);

  return { matches, checking, check };
}
