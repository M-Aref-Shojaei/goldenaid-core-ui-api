"use client";


import { useCallback, useMemo, useState } from "react";
import type { ProductSummary, ProductVariant } from "../types/catalog";
import type { CartItem } from "../types/orders";

/** In-memory shopping cart for the point-of-sale screen. */
export function usePOSCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback((product: ProductSummary, variant?: ProductVariant) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product_id === product.product_id && i.variant_id === variant?.id);
      if (existing) return prev.map((i) => i === existing ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product_id: product.product_id, title: product.title, base_price: product.base_price, qty: 1, thumbnail_url: product.thumbnail_url, variant_id: variant?.id, variant_label: variant?.label }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, qty: number) => {
    if (qty <= 0) { setCart((prev) => prev.filter((i) => i.product_id !== productId)); return; }
    setCart((prev) => prev.map((i) => (i.product_id === productId ? { ...i, qty } : i)));
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.product_id !== productId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);
  const total = useMemo(() => cart.reduce((sum, i) => sum + i.base_price * i.qty, 0), [cart]);

  return { cart, total, addToCart, updateQuantity, removeFromCart, clearCart };
}
