"use client";


import { useEffect, useMemo, useState } from "react";
import { adminListProducts } from "../api/catalog";
import type { AdminProductListItem } from "../types/admin";
import type { ProductSummary } from "../types/catalog";

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

/** Loads and client-side searches the admin product listing. Fetches only when `active` is true. */
export function useAdminProducts(active: boolean) {
  const [products, setProducts] = useState<AdminProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setLoading(true);
    adminListProducts({ limit: 500 })
      .then((res) => {
        if (cancelled) return;
        setProducts((res.products ?? []).map(normalizeProduct));
        setTotal(res.total ?? 0);
      })
      .catch(() => { if (!cancelled) { setProducts([]); setTotal(0); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [active]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      [p.title, p.subtitle, p.sku].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [products, searchQuery]);

  return { filteredProducts, total, loading, searchQuery, setSearchQuery };
}
