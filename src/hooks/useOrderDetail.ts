import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOrder } from "../api/orders";
import { createPayment } from "../api/payments";
import { useAuth } from "../providers/AuthProvider";
import type { Order } from "../types/orders";

/** Loads a single order by URL param `id` and provides a pay action for AWAITING_PAYMENT orders. */
export function useOrderDetail() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const id = params.id as string | undefined;
    if (!id) return;
    setLoading(true);
    getOrder(id)
      .then((data) => setOrder(data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handlePay = useCallback(async () => {
    if (!order) return;
    setPaying(true);
    try {
      const resp = await createPayment(order.id, order.total_amount);
      window.location.href = resp.payment_url;
    } catch {
      alert("خطا در ایجاد پرداخت. لطفاً دوباره تلاش کنید.");
    } finally {
      setPaying(false);
    }
  }, [order]);

  const goBack = useCallback(() => router.back(), [router]);

  return { order, loading, paying, isAuthenticated, handlePay, goBack };
}
