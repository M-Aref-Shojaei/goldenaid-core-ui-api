"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { API_CONFIG } from "../api/config";
import type { ProductSummary } from "../types/catalog";

export function usePOSProducts() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/products?is_active=true`);
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
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
