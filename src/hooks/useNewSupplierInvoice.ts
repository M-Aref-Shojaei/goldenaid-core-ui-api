"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupplierInvoice } from "../api/admin";
import { getErrorMessage, ApiError } from "../api/client";

/** One line item being edited in the manual-entry form. */
export interface InvoiceLineDraft {
  key: string;
  productId: string | null;
  title: string;
  qty: number;
  unitPrice: number;
}

function emptyLine(): InvoiceLineDraft {
  return { key: Math.random().toString(36).slice(2), productId: null, title: "", qty: 1, unitPrice: 0 };
}

/** Manages the new supplier-invoice manual-entry form: header fields, line
 *  items (add/update/remove), running total, and submission. Each line
 *  must resolve to a real product (via search or quick-create) before the
 *  invoice can be submitted — the backend requires a product_id per item. */
export function useNewSupplierInvoice() {
  const router = useRouter();
  const [supplierName, setSupplierName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [items, setItems] = useState<InvoiceLineDraft[]>([emptyLine()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateItem = (i: number, next: InvoiceLineDraft) =>
    setItems((arr) => arr.map((it, idx) => (idx === i ? next : it)));
  const removeItem = (i: number) => setItems((arr) => arr.filter((_, idx) => idx !== i));
  const addItem = () => setItems((arr) => [...arr, emptyLine()]);

  /** Prefills the header + line items from an extracted-file preview.
   *  Extracted lines have no product_id (there's no real catalog match yet
   *  from OCR/CSV text alone) — the admin still has to resolve each one via
   *  the product picker or quick-create before submitting, same as manual
   *  entry. */
  function prefillFromExtracted(data: {
    supplier: string;
    invoiceNumber: string;
    items: { title: string; qty: number; unitPrice: number }[];
  }) {
    setSupplierName(data.supplier);
    setInvoiceNumber(data.invoiceNumber);
    setItems(
      data.items.length
        ? data.items.map((it) => ({ key: Math.random().toString(36).slice(2), productId: null, title: it.title, qty: it.qty, unitPrice: it.unitPrice }))
        : [emptyLine()]
    );
  }

  const total = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
  const resolvedItems = items.filter((it) => it.productId);
  const canSubmit = !!supplierName.trim() && !!invoiceDate.trim() && resolvedItems.length > 0 && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      await createSupplierInvoice({
        supplier_name: supplierName.trim(),
        invoice_number: invoiceNumber.trim() || undefined,
        invoice_date: invoiceDate,
        items: resolvedItems.map((it) => ({
          product_id: it.productId as string,
          quantity: it.qty,
          unit_cost: it.unitPrice,
        })),
      });
      router.push("/invoices");
    } catch (e) {
      setError(getErrorMessage(e as ApiError));
      setSubmitting(false);
    }
  }

  return {
    supplierName, setSupplierName,
    invoiceNumber, setInvoiceNumber,
    invoiceDate, setInvoiceDate,
    items, updateItem, removeItem, addItem, prefillFromExtracted,
    total, canSubmit, submitting, error,
    handleSubmit,
  };
}
