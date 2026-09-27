"use client";


import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getOrder } from "../api/orders";
import { useCart } from "../providers/CartProvider";
import type { Order } from "../types/orders";

/** Possible outcomes on the payment callback page. */
export type PaymentStatusType = "success" | "failed" | "unknown";

/**
 * Decide what the payment-result page shows.
 *
 * The authenticated order is the source of truth; the `status` query param
 * (VERIFIED | FAILED | PENDING | ERROR, set by the callback redirect) is only
 * a hint, because anyone can type it into the URL.
 *
 * - order CONFIRMED -> success
 * - order AWAITING_PAYMENT -> "failed" when this attempt definitively failed
 *   (hint FAILED; the order can still be paid from its detail page), else
 *   "unknown" (verification still pending)
 * - any other order status (PAYMENT_FAILED = payment window expired, ...) -> failed
 * - order not loaded -> the hint, but never "success"
 */
function deriveStatus(order: Order | null, hint: string | null): PaymentStatusType {
  if (order) {
    if (order.status === "CONFIRMED") return "success";
    if (order.status === "AWAITING_PAYMENT") return hint === "FAILED" ? "failed" : "unknown";
    return "failed";
  }
  return hint === "FAILED" ? "failed" : "unknown";
}

/**
 * Reads payment callback query params, fetches the order and derives the
 * outcome from the order's real status (see {@link deriveStatus}). The cart
 * is cleared only once the order itself is CONFIRMED.
 */
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

  // Cleared only when the backend order is CONFIRMED -- never from the URL
  // hint (a forged ?status=VERIFIED must not empty the cart) and never on a
  // failed/pending payment. Guarded by a ref so re-renders clear at most once.
  useEffect(() => {
    if (order?.status === "CONFIRMED" && !clearedRef.current) {
      clearedRef.current = true;
      clearCart();
    }
  }, [order, clearCart]);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) { setLoading(false); return; }
      try {
        setOrder(await getOrder(orderId));
      } catch {
        // order fetch failed — page still renders from the hint
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const goToOrder = useCallback(() => { if (orderId) router.push(`/orders/${orderId}`); }, [orderId, router]);
  const goToDashboard = useCallback(() => router.push("/dashboard"), [router]);
  const goToHome = useCallback(() => router.push("/"), [router]);

  return { loading, order, orderId, status, refId, authority, statusType: deriveStatus(order, status), goToOrder, goToDashboard, goToHome };
}
