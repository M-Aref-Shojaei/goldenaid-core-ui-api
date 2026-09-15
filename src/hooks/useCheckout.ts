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
  const { items, totalPrice } = useCart();

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
      // The amount charged is derived entirely server-side (Payments looks
      // up the order's real total from Sales) -- the client never sends an
      // amount. See the IPG-readiness audit amount-tampering fix.
      const paymentResp = await createPayment(orderResp.order_id);
      // Do NOT clear the cart here: the user hasn't paid yet, and a
      // cancelled/failed gateway attempt would otherwise wrongly empty it.
      // The cart is cleared on the payment-result page, only once the
      // callback confirms a VERIFIED payment.
      window.location.href = paymentResp.payment_url;
    } catch (e: unknown) {
      setError(e instanceof ApiError ? getErrorMessage(e) : "خطا در ثبت سفارش");
      setStatus("idle");
    } finally {
      setLoading(false);
    }
  }, [selectedAddressId, items, totalPrice]);

  return {
    isAuthenticated, items, totalPrice,
    addresses, selectedAddressId, setSelectedAddressId,
    loadingAddresses, loading, status, error, handleCheckout,
  };
}
