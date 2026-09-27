"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createPurchaseItem,
  deletePurchaseItem,
  getPurchaseList,
  getPurchaseListInvoiceOptions,
  getPurchaseListSuppliers,
  transitionPurchaseItems,
  updatePurchaseItem,
} from "../api/admin";
import { ApiError, getErrorMessage } from "../api/client";
import type {
  PurchaseListInvoiceOption,
  PurchaseListItem,
  PurchaseListItemCreateInput,
  PurchaseListItemUpdateInput,
  PurchaseListTransitionInput,
} from "../types/admin";

/**
 * Manages the admin purchase list («لیست سفارش خرید», TASK-309): loads every
 * non-deleted item and exposes create/update/transition/delete actions plus
 * the supplier-suggestion and invoice-option lookups the receive dialog
 * needs. Every mutation reloads the list from the backend afterwards rather
 * than patching local state, since a transition can change several items
 * (bulk order/receive) and the backend is the source of truth for status.
 */
export function usePurchaseList() {
  const [items, setItems] = useState<PurchaseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mutating, setMutating] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await getPurchaseList());
    } catch (e) {
      setError(getErrorMessage(e as ApiError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  /** Runs a mutation, reloads the list on success, and surfaces the error
   *  message on failure without touching the current list. Returns whether
   *  it succeeded, so callers can decide whether to close a dialog. */
  async function runMutation(fn: () => Promise<unknown>): Promise<boolean> {
    setMutating(true);
    setError("");
    try {
      await fn();
      await reload();
      return true;
    } catch (e) {
      setError(getErrorMessage(e as ApiError));
      return false;
    } finally {
      setMutating(false);
    }
  }

  const createItem = (data: PurchaseListItemCreateInput) => runMutation(() => createPurchaseItem(data));
  const updateItem = (itemId: string, data: PurchaseListItemUpdateInput) =>
    runMutation(() => updatePurchaseItem(itemId, data));
  const transitionItems = (data: PurchaseListTransitionInput) => runMutation(() => transitionPurchaseItems(data));
  const deleteItem = (itemId: string) => runMutation(() => deletePurchaseItem(itemId));

  return {
    items, loading, error, mutating, reload,
    createItem, updateItem, transitionItems, deleteItem,
  };
}

/** Fetches supplier-name suggestions for the purchase list's free-text
 *  supplier field. */
export function usePurchaseListSuppliers() {
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setSuppliers(await getPurchaseListSuppliers());
      } catch (e) {
        setError(getErrorMessage(e as ApiError));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { suppliers, loading, error };
}

/** Fetches the recent-invoice options for the receive dialog's «فاکتور
 *  خرید» select, refetching whenever the chosen suppliers change. */
export function usePurchaseListInvoiceOptions(suppliers: string[]) {
  const [options, setOptions] = useState<PurchaseListInvoiceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const key = suppliers.join("\u0000");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await getPurchaseListInvoiceOptions(key ? key.split("\u0000") : []);
        if (!cancelled) setOptions(res);
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e as ApiError));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { options, loading, error };
}
