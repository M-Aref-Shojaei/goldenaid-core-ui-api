"use client";


import { useCallback, useEffect, useRef, useState } from "react";
import { adminListProducts } from "../api/catalog";
import type { AdminProductListItem } from "../types/admin";
import type { ProductSummary } from "../types/catalog";

const PAGE_SIZE = 500;
const SEARCH_DEBOUNCE_MS = 300;

function normalizeProduct(p: ProductSummary): AdminProductListItem {
  return {
    id: String(p.product_id ?? ""),
    title: String(p.title ?? ""),
    subtitle: p.subtitle ? String(p.subtitle) : undefined,
    sku: p.sku ? String(p.sku) : undefined,
    base_price: Number(p.base_price ?? 0),
    currency: p.currency ? String(p.currency) : "IRT",
    image_url: p.thumbnail_url ?? undefined,
    is_active: Boolean(p.is_active),
  };
}

/** Loads the admin product listing with server-side search. Fetches only when
 *  `active` is true. Search is server-side (debounced) rather than filtering
 *  the browse page client-side — a client-side filter over one fetched page
 *  could never find a product ranked past that page (e.g. product #600 of
 *  1200+ was unsearchable when the old client-side filter only ever saw the
 *  first 500), which made a just-edited product look like it "disappeared"
 *  whenever it happened to sit outside that first slice. */
export function useAdminProducts(active: boolean) {
  const [products, setProducts] = useState<AdminProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isFirstRun = useRef(true);

  const load = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await adminListProducts({ limit: PAGE_SIZE, search: q || undefined });
      setProducts((res.products ?? []).map(normalizeProduct));
      setTotal(res.total ?? 0);
    } catch {
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    if (isFirstRun.current) {
      isFirstRun.current = false;
      load(searchQuery);
      return;
    }
    const timer = setTimeout(() => load(searchQuery), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, searchQuery]);

  return { filteredProducts: products, total, loading, searchQuery, setSearchQuery };
}
