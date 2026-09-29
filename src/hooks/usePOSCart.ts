"use client";


import { useCallback, useMemo, useState } from "react";
import type { ProductSummary, ProductVariant, StockBatch } from "../types/catalog";
import type { CartItem } from "../types/orders";

/** A POS cart line's identity: gift vs paid, product, variant and FEFO batch. */
function lineKey(i: Pick<CartItem, "product_id" | "variant_id" | "batch_id" | "is_gift">): string {
  return `${i.is_gift ? "gift-" : ""}${i.product_id}-${i.variant_id ?? ""}-${i.batch_id ?? ""}`;
}

/** Dev-only: flags a pre-2.0 `product_id` call that would otherwise silently no-op. */
function warnUnknownKey(cart: CartItem[], key: string): void {
  if (process.env.NODE_ENV !== "production" && !cart.some((i) => i.key === key)) {
    console.warn(`usePOSCart: no cart line with key "${key}" -- pass CartItem.key, not product_id (2.0.0).`);
  }
}

/**
 * **2.0.0 migration:** `updateQuantity`/`removeFromCart` now take the line's
 * `CartItem.key`, not `product_id` (both are strings, so an old call still
 * type-checks; in dev it logs a warning instead of silently doing nothing).
 *
 * In-memory shopping cart for the point-of-sale screen. Every line carries a
 * `key` (see `CartItem.key`); `updateQuantity`/`removeFromCart` act by it, so a
 * gift and a paid line of one product, or two batches of it, stay separate.
 *
 * @param initialItems Optional pre-seeded items -- used by the "edit POS
 * sale" flow to load an existing order's items into the cart (keys are
 * derived). Only read on first render (like `useState`'s initializer); pass a
 * stable reference or remount the component when it changes.
 */
export function usePOSCart(initialItems: CartItem[] = []) {
  const [cart, setCart] = useState<CartItem[]>(() => initialItems.map((i) => ({ ...i, key: lineKey(i) })));

  /** Adds one unit; `opts.gift` adds it as a free gift line (`base_price` 0). */
  const addToCart = useCallback((product: ProductSummary, variant?: ProductVariant, batch?: StockBatch, opts?: { gift?: boolean }) => {
    const gift = opts?.gift === true;
    const key = lineKey({ product_id: product.product_id, variant_id: variant?.id, batch_id: batch?.id, is_gift: gift });
    setCart((prev) => {
      if (prev.some((i) => i.key === key)) return prev.map((i) => i.key === key ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { key, product_id: product.product_id, title: product.title, base_price: gift ? 0 : product.base_price, qty: 1, thumbnail_url: product.thumbnail_url, variant_id: variant?.id, variant_label: variant?.label, batch_id: batch?.id, batch_expiry_date: batch?.expiry_date, ...(gift ? { is_gift: true } : {}) }];
    });
  }, []);

  const updateQuantity = useCallback((key: string, qty: number) => {
    setCart((prev) => {
      warnUnknownKey(prev, key);
      return qty <= 0 ? prev.filter((i) => i.key !== key) : prev.map((i) => (i.key === key ? { ...i, qty } : i));
    });
  }, []);

  const removeFromCart = useCallback((key: string) => {
    setCart((prev) => { warnUnknownKey(prev, key); return prev.filter((i) => i.key !== key); });
  }, []);

  const clearCart = useCallback(() => setCart([]), []);
  /** Paid lines only: gifts are free. This is the pre-discount subtotal. */
  const total = useMemo(() => cart.reduce((sum, i) => (i.is_gift ? sum : sum + i.base_price * i.qty), 0), [cart]);

  return { cart, total, addToCart, updateQuantity, removeFromCart, clearCart };
}
