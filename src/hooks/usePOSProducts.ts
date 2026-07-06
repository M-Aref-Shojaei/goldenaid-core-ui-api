"use client";


import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/client";
import type { ProductSummary } from "../types/catalog";

/** Loads active products for the POS product grid with client-side search. */
export function usePOSProducts() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<ProductSummary[] | { items: ProductSummary[] }>("/products?is_active=true");
      setProducts(Array.isArray(data) ? data : (data.items ?? []));
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      [p.title, p.subtitle, p.sku].filter(Boolean).some((f) => String(f).toLowerCase().includes(q)),
    );
  }, [products, searchQuery]);

  return { products, filteredProducts, searchQuery, setSearchQuery, loading, reload };
}
