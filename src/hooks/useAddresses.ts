"use client";


import { useEffect, useState, useCallback } from "react";
import { listAddresses, deleteAddress } from "../api/addresses";
import { ApiError, getErrorMessage } from "../api/client";
import type { Address } from "../types/addresses";

/** Return type for {@link useAddresses}. */
export interface UseAddressesResult {
  addresses: Address[];
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
  deleteAddress: (id: number) => Promise<void>;
}

/** Loads and manages the authenticated user's saved delivery addresses. */
export function useAddresses(): UseAddressesResult {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setAddresses((await listAddresses()) || []);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? getErrorMessage(err) : "خطا در بارگذاری آدرس‌ها");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    await deleteAddress(id);
    await reload();
  }, [reload]);

  useEffect(() => { reload(); }, [reload]);

  return { addresses, loading, error, reload, deleteAddress: handleDelete };
}
