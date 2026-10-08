"use client";


import { useCallback, useEffect, useMemo, useState } from "react";
import { adminListProducts, listProducts } from "../api/catalog";
import type { ProductGroup, ProductSummary } from "../types/catalog";
import { filterProducts, findExactMatch } from "../utils/search";

const PAGE_SIZE = 200; // backend's max allowed `limit` per request
const GROUP_PAGE_SIZE = 500; // admin list max

/** product_id → admin-only group, read page by page from the admin list
 *  (the public/POS feed never carries `group`). First page, then the rest in parallel. */
async function loadGroupMap(): Promise<Record<string, ProductGroup | null>> {
  const map: Record<string, ProductGroup | null> = {};
  const add = (rows: { product_id: string; group?: ProductGroup | null }[]) =>
    rows.forEach((r) => { map[r.product_id] = r.group ?? null; });
  const first = await adminListProducts({ skip: 0, limit: GROUP_PAGE_SIZE, is_active: true });
  add(first.products ?? []);
  const pageSize = first.limit || GROUP_PAGE_SIZE;
  const rest: Promise<void>[] = [];
  for (let skip = pageSize; skip < (first.total ?? 0); skip += pageSize) {
    rest.push(adminListProducts({ skip, limit: pageSize, is_active: true }).then((r) => add(r.products ?? [])));
  }
  await Promise.all(rest);
  return map;
}

/** Loads active products for the POS product grid with client-side search.
 *  Pages through the full catalog (not just the first page) so the register
 *  can find anything the storefront can — previously called `/products`
 *  with no `limit`, silently capped at the backend's default of 50.
 *
 *  TASK-351: the feed asks for `include_pos_only` (staff), so POS-only and
 *  pending-invoice products are listed (`pending_invoice` → shown, not
 *  sellable). Admin-only groups are loaded in the background after the grid
 *  (never blocking it) and merged as `product.group`; `group` / `setGroup`
 *  filter client-side, ANDed with the search. */
export function usePOSProducts() {
  const [rawProducts, setProducts] = useState<ProductSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [groupById, setGroupById] = useState<Record<string, ProductGroup | null> | null>(null);
  const [groupsError, setGroupsError] = useState(false);
  const [group, setGroup] = useState<ProductGroup | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const all: ProductSummary[] = [];
      let offset = 0;
      let reportedTotal = 0;
      for (;;) {
        const page = await listProducts(PAGE_SIZE, offset, true, true);
        all.push(...page.items);
        reportedTotal = page.total;
        if (page.items.length === 0 || all.length >= page.total) break;
        offset += PAGE_SIZE;
      }
      setProducts(all);
      setTotal(reportedTotal);
    } catch { setProducts([]); setTotal(0); }
    finally { setLoading(false); }
    try {
      setGroupById(await loadGroupMap());
      setGroupsError(false);
    } catch {
      setGroupsError(true);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const products = useMemo(
    () => (groupById ? rawProducts.map((p) => ({ ...p, group: groupById[p.product_id] ?? null })) : rawProducts),
    [rawProducts, groupById],
  );

  const filteredProducts = useMemo(() => {
    const searched = filterProducts(products, searchQuery);
    return group ? searched.filter((p) => p.group === group) : searched;
  }, [products, searchQuery, group]);

  /** Exact barcode / sku hit for the current input (a scanner's Enter adds it). */
  const exactMatch = useMemo(() => findExactMatch(products, searchQuery), [products, searchQuery]);

  return {
    products, filteredProducts, exactMatch, total, searchQuery, setSearchQuery, loading, reload,
    group, setGroup, groupsLoaded: groupById !== null, groupsError,
  };
}
