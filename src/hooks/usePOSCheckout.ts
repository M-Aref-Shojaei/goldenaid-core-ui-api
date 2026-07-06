"use client";


import { useCallback, useState } from "react";
import { apiFetch } from "../api/client";
import type { CartItem } from "../types/orders";

/** Payment method options for POS checkout. */
export type PaymentMethod = "cash" | "card" | "transfer";

/** Walk-in customer info collected during POS checkout. */
export interface POSCustomer { name: string; phone: string; email: string; }

interface POSOrderItemPayload { product_id: string; quantity: number; unit_price: number; }

interface POSOrderPayload {
  customer_name: string; customer_phone: string; customer_email: string;
  items: POSOrderItemPayload[]; payment_method: PaymentMethod;
  amount_paid: number; notes: string; total_amount: number;
}

/** Printable receipt data generated after a successful POS checkout. */
export interface POSReceipt {
  order_id?: string; customer: POSCustomer; items: CartItem[];
  total: number; paymentMethod: PaymentMethod; amountPaid: number; change: number;
}

const EMPTY_CUSTOMER: POSCustomer = { name: "", phone: "", email: "" };

/** Manages customer info, payment method, and checkout submission for the POS screen. */
export function usePOSCheckout(onSuccess?: () => void) {
  const [customer, setCustomer] = useState<POSCustomer>(EMPTY_CUSTOMER);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState<POSReceipt | null>(null);

  const calculateChange = useCallback(
    (total: number) => Math.max(0, (parseFloat(amountPaid) || 0) - total),
    [amountPaid],
  );

  const checkout = useCallback(async (cart: CartItem[], total: number): Promise<boolean> => {
    if (cart.length === 0) return false;
    setSubmitting(true);
    const paid = paymentMethod === "cash" ? parseFloat(amountPaid) || total : total;
    const payload: POSOrderPayload = {
      customer_name: customer.name, customer_phone: customer.phone, customer_email: customer.email,
      items: cart.map((i) => ({ product_id: i.product_id, quantity: i.qty, unit_price: i.base_price })),
      payment_method: paymentMethod, amount_paid: paid, notes: "فروش حضوری - POS",
      total_amount: total,
    };
    try {
      const data = await apiFetch<{ order_id?: string }>("/admin/pos/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setLastOrder({ order_id: data.order_id, customer, items: cart, total, paymentMethod, amountPaid: paid, change: paymentMethod === "cash" ? Math.max(0, paid - total) : 0 });
      setShowReceipt(true);
      onSuccess?.();
      return true;
    } catch { return false; }
    finally { setSubmitting(false); }
  }, [amountPaid, customer, paymentMethod, onSuccess]);

  const closeReceipt = useCallback(() => {
    setShowReceipt(false); setLastOrder(null);
    setCustomer(EMPTY_CUSTOMER); setPaymentMethod("cash"); setAmountPaid("");
  }, []);

  return { customer, setCustomer, paymentMethod, setPaymentMethod, amountPaid, setAmountPaid, submitting, showReceipt, lastOrder, calculateChange, checkout, closeReceipt };
}
