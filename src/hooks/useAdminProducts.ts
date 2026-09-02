"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { adminListProducts } from "../api/catalog";
import type { AdminProductListItem } from "../types/admin";
import type { ProductSummary } from "../types/catalog";

const PAGE_SIZE = 40;
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

/** Loads the admin product listing with server-side search and infinite
 *  scroll (no page-number UI): `loadMore()` fetches the next `PAGE_SIZE`
 *  products and appends them. Search is server-side (debounced) and always
 *  resets back to the first page — a client-side filter over one fetched
 *  page could never find a product ranked past that page (e.g. product #600
 *  of 1200+ was unsearchable when an old version only ever fetched the first
 *  500), which made a just-edited product look like it "disappeared". A
 *  request counter guards against a slow, now-stale search response
 *  clobbering a newer one that resolved first. */
export function useAdminProducts(active: boolean) {
  const [products, setProducts] = useState<AdminProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isFirstRun = useRef(true);
  const requestId = useRef(0);

  const loadPage = useCallback(async (q: string, skip: number, reset: boolean) => {
    const id = ++requestId.current;
    if (reset) setLoading(true);
    else setLoadingMore(true);
    try {
      const res = await adminListProducts({ skip, limit: PAGE_SIZE, search: q || undefined });
      if (id !== requestId.current) return;
      const page = (res.products ?? []).map(normalizeProduct);
      setProducts((prev) => (reset ? page : [...prev, ...page]));
      setTotal(res.total ?? 0);
    } catch {
      if (id !== requestId.current) return;
      if (reset) {
        setProducts([]);
        setTotal(0);
      }
    } finally {
      if (id === requestId.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    if (isFirstRun.current) {
      isFirstRun.current = false;
      loadPage(searchQuery, 0, true);
      return;
    }
    const timer = setTimeout(() => loadPage(searchQuery, 0, true), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, searchQuery]);

  const hasMore = products.length < total;

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    loadPage(searchQuery, products.length, false);
  }, [loading, loadingMore, hasMore, searchQuery, products.length, loadPage]);

  return {
    filteredProducts: products,
    total,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    searchQuery,
    setSearchQuery,
  };
}
