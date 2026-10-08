"use client";


import { useCallback, useEffect, useMemo, useState } from "react";
import { listProducts } from "../api/catalog";
import type { ProductSummary } from "../types/catalog";
import { filterProducts } from "../utils/search";

const PAGE_SIZE = 200; // backend's max allowed `limit` per request

/** Loads active products for the POS product grid with client-side search.
 *  Pages through the full catalog (not just the first page) so the register
 *  can find anything the storefront can — previously called `/products`
 *  with no `limit`, silently capped at the backend's default of 50. */
export function usePOSProducts() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const all: ProductSummary[] = [];
      let offset = 0;
      let reportedTotal = 0;
      for (;;) {
        const page = await listProducts(PAGE_SIZE, offset, true);
        all.push(...page.items);
        reportedTotal = page.total;
        if (page.items.length === 0 || all.length >= page.total) break;
        offset += PAGE_SIZE;
      }
      setProducts(all);
      setTotal(reportedTotal);
    } catch { setProducts([]); setTotal(0); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const filteredProducts = useMemo(
    () => filterProducts(products, searchQuery),
    [products, searchQuery],
  );

  return { products, filteredProducts, total, searchQuery, setSearchQuery, loading, reload };
}
