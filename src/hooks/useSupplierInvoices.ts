"use client";

import { useEffect, useState } from "react";
import { getSupplierInvoices } from "../api/admin";
import { ApiError, getErrorMessage } from "../api/client";
import type { SupplierInvoice } from "../types/admin";

/** Fetches the admin supplier-invoice listing. */
export function useSupplierInvoices() {
  const [invoices, setInvoices] = useState<SupplierInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function reload() {
    setLoading(true);
    setError("");
    try {
      setInvoices(await getSupplierInvoices());
    } catch (e) {
      setError(getErrorMessage(e as ApiError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { reload(); }, []);

  return { invoices, loading, error, reload };
}
