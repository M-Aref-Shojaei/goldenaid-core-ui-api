"use client";


import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getOrder } from "../api/orders";
import { useCart } from "../providers/CartProvider";
import type { Order } from "../types/orders";

/** Possible outcomes on the payment callback page. */
export type PaymentStatusType = "success" | "failed" | "unknown";

function deriveStatus(status: string | null): PaymentStatusType {
  if (status === "VERIFIED") return "success";
  if (status === "FAILED" || status === "ERROR") return "failed";
  return "unknown";
}

/** Reads payment callback query params, derives status, and fetches the associated order. */
export function usePaymentResult() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const clearedRef = useRef(false);

  const orderId = searchParams.get("order_id");
  const status = searchParams.get("status");
  const refId = searchParams.get("ref_id");
  const authority = searchParams.get("Authority");

  // The cart is only ever cleared here, once the backend-confirmed callback
  // says the payment was actually VERIFIED -- never optimistically before
  // the gateway redirect. A cancelled/failed payment must leave the cart
  // intact. Guarded by a ref so re-renders don't clear more than once.
  useEffect(() => {
    if (status === "VERIFIED" && !clearedRef.current) {
      clearedRef.current = true;
      clearCart();
    }
  }, [status, clearCart]);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) { setLoading(false); return; }
      try {
        setOrder(await getOrder(orderId));
      } catch {
        // order fetch failed — page still renders result
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const goToOrder = useCallback(() => { if (orderId) router.push(`/orders/${orderId}`); }, [orderId, router]);
  const goToDashboard = useCallback(() => router.push("/dashboard"), [router]);
  const goToHome = useCallback(() => router.push("/"), [router]);

  return { loading, order, orderId, status, refId, authority, statusType: deriveStatus(status), goToOrder, goToDashboard, goToHome };
}
