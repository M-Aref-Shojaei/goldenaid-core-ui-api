"use client";


import { useCallback, useState } from "react";
import { apiFetch, ApiError, getErrorMessage } from "../api/client";
import { useToast } from "../components/Toast";
import type { CartItem, DiscountInput, Order } from "../types/orders";

/** Payment method options for POS checkout. */
export type PaymentMethod = "cash" | "card" | "transfer";

/** Walk-in customer info collected during POS checkout. */
export interface POSCustomer { name: string; phone: string; email: string; }

interface POSOrderItemPayload { product_id: string; quantity: number; unit_price: number; variant_id?: string; variant_label?: string; batch_id?: string; is_gift: boolean; }

interface POSOrderPayload {
  customer_name: string; customer_phone: string; customer_email: string;
  items: POSOrderItemPayload[]; payment_method: PaymentMethod;
  amount_paid: number; notes: string; total_amount: number;
  discount: DiscountInput | null;
}

/** Printable receipt data generated after a successful POS checkout. */
export interface POSReceipt {
  order_id?: string; customer: POSCustomer; items: CartItem[];
  total: number; paymentMethod: PaymentMethod; amountPaid: number; change: number;
  /** Server-computed cash tendered / change due (core-bff normalizes `amount_paid`
   *  server-side, TASK-335); undefined for non-cash payments or an older core-bff. */
  cashTendered?: number; changeDue?: number;
  /** The server's order-create response, verbatim: the enriched order
   *  (items with gift lines, `subtotal_amount`, `discount`, net `total_amount`)
   *  plus `cash_tendered`/`change_due`. Render the receipt from this. It is only
   *  partial (no `items`) when core-bff's post-confirm re-fetch failed. */
  order?: POSOrderResponse;
}

/** POS order-create response: the enriched order (fields optional, since
 *  core-bff degrades to the bare confirm result if its re-fetch fails). */
export type POSOrderResponse = Partial<Order> & { cash_tendered?: number; change_due?: number };

const EMPTY_CUSTOMER: POSCustomer = { name: "", phone: "", email: "" };

/** Manages customer info, payment method, and checkout submission for the POS screen. */
export function usePOSCheckout(onSuccess?: () => void) {
  const { toast } = useToast();
  const [customer, setCustomer] = useState<POSCustomer>(EMPTY_CUSTOMER);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState<POSReceipt | null>(null);
  const [error, setError] = useState("");

  const calculateChange = useCallback(
    (total: number) => Math.max(0, (parseFloat(amountPaid) || 0) - total),
    [amountPaid],
  );

  /** Submits the sale. `total` is the expected NET total (after `discount`);
   *  gift lines go out with `unit_price` 0. Resolves false on failure (see `error`). */
  const checkout = useCallback(async (cart: CartItem[], total: number, discount?: DiscountInput | null): Promise<boolean> => {
    if (cart.length === 0) return false;
    setSubmitting(true);
    setError("");
    const paid = paymentMethod === "cash" ? parseFloat(amountPaid) || total : total;
    const payload: POSOrderPayload = {
      customer_name: customer.name, customer_phone: customer.phone, customer_email: customer.email,
      items: cart.map((i) => ({ product_id: i.product_id, quantity: i.qty, unit_price: i.is_gift ? 0 : i.base_price, variant_id: i.variant_id, variant_label: i.variant_label, batch_id: i.batch_id, is_gift: i.is_gift === true })),
      payment_method: paymentMethod, amount_paid: paid, notes: "فروش حضوری - POS",
      total_amount: total, discount: discount ?? null,
    };
    try {
      const data = await apiFetch<POSOrderResponse>("/admin/pos/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setLastOrder({
        order_id: data.order_id, customer, items: cart, total, paymentMethod, amountPaid: paid,
        change: paymentMethod === "cash" ? Math.max(0, paid - total) : 0,
        cashTendered: data.cash_tendered, changeDue: data.change_due, order: data,
      });
      setShowReceipt(true);
      toast("فروش با موفقیت ثبت شد", "success");
      onSuccess?.();
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? getErrorMessage(err) : "خطا در ثبت فروش. دوباره تلاش کنید");
      return false;
    }
    finally { setSubmitting(false); }
  }, [amountPaid, customer, paymentMethod, onSuccess, toast]);

  const closeReceipt = useCallback(() => {
    setShowReceipt(false); setLastOrder(null);
    setCustomer(EMPTY_CUSTOMER); setPaymentMethod("cash"); setAmountPaid("");
  }, []);

  return { customer, setCustomer, paymentMethod, setPaymentMethod, amountPaid, setAmountPaid, submitting, showReceipt, lastOrder, error, calculateChange, checkout, closeReceipt };
}
