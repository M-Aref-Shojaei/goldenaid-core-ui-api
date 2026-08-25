"use client";


import { useState, useEffect, useCallback } from "react";
import { apiFetch, ApiError, getErrorMessage } from "../api/client";
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
      const data = await apiFetch<AdminProductDetailProduct>(`/admin/products/${productId}`);
      setProduct(data);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? getErrorMessage(err) : "خطا در بارگذاری محصول");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  return { product, loading, error, reload: fetchProduct };
}
