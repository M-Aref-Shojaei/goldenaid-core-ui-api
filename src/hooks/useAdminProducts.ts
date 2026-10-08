"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { adminListProducts } from "../api/catalog";
import type { AdminProductListItem } from "../types/admin";
import type { AdminProductListResponse, ProductGroup, ProductStatusCounts, ProductStatusTab } from "../types/catalog";

const PAGE_SIZE = 40;
const SEARCH_DEBOUNCE_MS = 300;

function normalizeProduct(p: AdminProductListResponse["products"][number]): AdminProductListItem {
  return {
    id: String(p.product_id ?? ""),
    title: String(p.title ?? ""),
    subtitle: p.subtitle ? String(p.subtitle) : undefined,
    sku: p.sku ? String(p.sku) : undefined,
    base_price: Number(p.base_price ?? 0),
    currency: p.currency ? String(p.currency) : "IRT",
    image_url: p.thumbnail_url ?? undefined,
    is_active: Boolean(p.is_active),
    group: p.group ?? null,
    pending_invoice: Boolean(p.pending_invoice),
    pos_only: Boolean(p.pos_only),
    incomplete: Boolean(p.incomplete),
    missing: p.missing ?? [],
    imported: Boolean(p.imported),
    created_from_invoice_id: p.created_from_invoice_id ?? null,
  };
}

/** Options of {@link useAdminProducts}. */
export interface AdminProductsOptions {
  /** Ask for `status_counts` (the products list's tab labels). */
  withCounts?: boolean;
  /** Initial status tab; undefined = no status filter (pickers). */
  initialStatus?: ProductStatusTab;
}

/** Loads the admin product listing with server-side search and infinite
 *  scroll (no page-number UI): `loadMore()` fetches the next `PAGE_SIZE`
 *  products and appends them. Search is server-side (debounced) and always
 *  resets back to the first page — a client-side filter over one fetched
 *  page could never find a product ranked past that page (e.g. product #600
 *  of 1200+ was unsearchable when an old version only ever fetched the first
 *  500), which made a just-edited product look like it "disappeared". A
 *  request counter guards against a slow, now-stale search response
 *  clobbering a newer one that resolved first.
 *
 *  TASK-351: `group` (admin-only, null = «همه») and `status` (tab) filter
 *  server-side too and apply immediately (no debounce); rows carry the
 *  quick-add flags and, with `withCounts`, `statusCounts` follow search + group. */
export function useAdminProducts(active: boolean, { withCounts = false, initialStatus }: AdminProductsOptions = {}) {
  const [products, setProducts] = useState<AdminProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [group, setGroup] = useState<ProductGroup | null>(null);
  const [status, setStatus] = useState<ProductStatusTab | undefined>(initialStatus);
  const [statusCounts, setStatusCounts] = useState<ProductStatusCounts | null>(null);
  const isFirstRun = useRef(true);
  const lastSearch = useRef(searchQuery);
  const requestId = useRef(0);

  const loadPage = useCallback(async (q: string, skip: number, reset: boolean, g: ProductGroup | null, st?: ProductStatusTab) => {
    const id = ++requestId.current;
    if (reset) setLoading(true);
    else setLoadingMore(true);
    try {
      const res = await adminListProducts({
        skip,
        limit: PAGE_SIZE,
        search: q || undefined,
        ...(g || st || withCounts ? { group: g ?? undefined, status: st } : {}),
        ...(withCounts && reset ? { counts: true } : {}),
      });
      if (id !== requestId.current) return;
      const page = (res.products ?? []).map(normalizeProduct);
      setProducts((prev) => (reset ? page : [...prev, ...page]));
      setTotal(res.total ?? 0);
      if (res.status_counts) setStatusCounts(res.status_counts);
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
  }, [withCounts]);

  useEffect(() => {
    if (!active) return;
    const searchChanged = lastSearch.current !== searchQuery;
    lastSearch.current = searchQuery;
    if (isFirstRun.current || !searchChanged) {
      isFirstRun.current = false;
      loadPage(searchQuery, 0, true, group, status);
      return;
    }
    const timer = setTimeout(() => loadPage(searchQuery, 0, true, group, status), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, searchQuery, group, status]);

  const hasMore = products.length < total;

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    loadPage(searchQuery, products.length, false, group, status);
  }, [loading, loadingMore, hasMore, searchQuery, products.length, loadPage, group, status]);

  return {
    filteredProducts: products,
    total,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    searchQuery,
    setSearchQuery,
    group,
    setGroup,
    status,
    setStatus,
    statusCounts,
  };
}
