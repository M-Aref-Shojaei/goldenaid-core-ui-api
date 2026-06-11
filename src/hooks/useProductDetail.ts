"use client";

import { useState, useEffect, useCallback } from "react";
import { API_CONFIG, STORAGE_KEYS } from "../api/config";
import type { AdminProductDetailProduct } from "../types/admin";

/** Fetches the full admin product detail record by ID. */
export function useProductDetail(productId: string) {
  const [product, setProduct] = useState<AdminProductDetailProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProduct = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const res = await fetch(`${API_CONFIG.BASE_URL}/admin/products/${productId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("محصول یافت نشد");
      setProduct(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "خطا در بارگذاری محصول");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  return { product, loading, error, reload: fetchProduct };
}
