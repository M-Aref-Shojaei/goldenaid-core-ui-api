"use client";


import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useCart } from "../providers/CartProvider";
import { listAddresses } from "../api/addresses";
import { createOrder } from "../api/orders";
import { createPayment } from "../api/payments";
import { ApiError, getErrorMessage } from "../api/client";
import type { Address } from "../types/addresses";

/** Checkout flow state — idle → ordering (create order) → paying (redirect to gateway). */
export type CheckoutStatus = "idle" | "ordering" | "paying";

/** Manages the multi-step checkout: address selection → order creation → payment redirect. */
export function useCheckout() {
  const { isAuthenticated } = useAuth();
  const { items, totalPrice, clearCart } = useCart();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<CheckoutStatus>("idle");
  const [error, setError] = useState("");

  const loadAddresses = useCallback(async () => {
    setLoadingAddresses(true);
    try {
      const data = await listAddresses();
      setAddresses(data || []);
      if (data && data.length > 0) setSelectedAddressId(data[0].id);
    } catch {
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadAddresses();
  }, [isAuthenticated, loadAddresses]);

  const handleCheckout = useCallback(async () => {
    setError("");
    if (!selectedAddressId) {
      setError("لطفاً یک آدرس انتخاب کنید");
      return;
    }
    setLoading(true);
    setStatus("ordering");
    try {
      const orderItems = items.map((i) => ({
        product_id: i.product_id,
        qty: i.qty,
        ...(i.variant_id ? { variant_id: i.variant_id, variant_label: i.variant_label } : {}),
      }));
      const orderResp = await createOrder(orderItems, totalPrice);
      setStatus("paying");
      // The order total (and every price in the app) is toman-denominated.
      // The payment gateway is the one boundary that requires rial, so this
      // is the single toman→rial conversion point in the whole checkout flow.
      const rialAmount = Math.round(totalPrice * 10);
      const paymentResp = await createPayment(orderResp.order_id, rialAmount);
      clearCart();
      window.location.href = paymentResp.payment_url;
    } catch (e: unknown) {
      setError(e instanceof ApiError ? getErrorMessage(e) : "خطا در ثبت سفارش");
      setStatus("idle");
    } finally {
      setLoading(false);
    }
  }, [selectedAddressId, items, totalPrice, clearCart]);

  return {
    isAuthenticated, items, totalPrice,
    addresses, selectedAddressId, setSelectedAddressId,
    loadingAddresses, loading, status, error, handleCheckout,
  };
}
