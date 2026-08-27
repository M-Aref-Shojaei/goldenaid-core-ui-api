"use client";


import { useEffect, useState } from "react";
import { getProduct } from "../api/catalog";
import { useCart } from "../providers/CartProvider";
import type { ProductDetail } from "../types/catalog";

/** Fetches a product by ID (optionally scoped to a variant) and provides an add-to-cart action. */
export function useProduct(id: string | undefined, variantId?: string) {
  const { addItem } = useCart();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    getProduct(id, variantId)
      .then((data) => active && setProduct(data))
      .catch(() => { if (active) setProduct(null); })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id, variantId]);

  const addToCart = (qty: number) => {
    if (!product) return;
    const variant = variantId ? product.variants.find((v) => v.id === variantId) : undefined;
    addItem({
      product_id: product.product_id,
      title: product.title,
      base_price: product.base_price,
      thumbnail_url: product.thumbnail_url || null,
      ...(variant ? { variant_id: variant.id, variant_label: variant.label } : {}),
    }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return { product, loading, added, addToCart };
}
