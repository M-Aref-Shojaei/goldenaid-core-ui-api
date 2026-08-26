"use client";


import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { CartItem } from "../types/orders";

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">, qty: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQty: (productId: string, qty: number, variantId?: string) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "golden-aid-cart";

/** Writes `next` to `localStorage` synchronously and returns it, for use inside a `setItems` updater. */
function persist(next: CartItem[]): CartItem[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

/**
 * Persists the shopping cart in `localStorage` and exposes cart actions to the tree.
 *
 * Cart mutations persist synchronously inside the `setItems` updater rather
 * than via a reactive `useEffect` on `items` — a `useEffect` write is
 * deferred until after paint, so a fast full-page navigation right after
 * adding to cart (e.g. `location`/`router` change) can race ahead of it and
 * silently lose the write.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch { /* corrupted — start empty */ }
  }, []);

  const addItem = useCallback((item: Omit<CartItem, "qty">, qty: number) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.product_id === item.product_id && i.variant_id === item.variant_id,
      );
      const next = existing
        ? prev.map((i) =>
            i.product_id === item.product_id && i.variant_id === item.variant_id
              ? { ...i, qty: i.qty + qty }
              : i,
          )
        : [...prev, { ...item, qty }];
      return persist(next);
    });
  }, []);

  const removeItem = useCallback((productId: string, variantId?: string) => {
    setItems((prev) =>
      persist(
        prev.filter((i) => !(i.product_id === productId && i.variant_id === variantId)),
      ),
    );
  }, []);

  const updateQty = useCallback((productId: string, qty: number, variantId?: string) => {
    if (qty <= 0) {
      setItems((prev) =>
        persist(
          prev.filter((i) => !(i.product_id === productId && i.variant_id === variantId)),
        ),
      );
      return;
    }
    setItems((prev) =>
      persist(
        prev.map((i) =>
          i.product_id === productId && i.variant_id === variantId ? { ...i, qty } : i,
        ),
      ),
    );
  }, []);

  const clearCart = useCallback(() => setItems(persist([])), []);

  const totalPrice = items.reduce((sum, i) => sum + i.base_price * i.qty, 0);
  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, totalPrice, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

/** Returns the cart context. Must be used inside {@link CartProvider}. */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
