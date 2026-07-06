"use client";

import { useCallback, useEffect, useState } from "react";
import { getAdminCustomers } from "../api/admin";
import type { Customer } from "../types/admin";

const PAGE_SIZE = 50;

function mapCustomer(c: Record<string, unknown>): Customer {
  return {
    id: String(c.user_id ?? c.id ?? ""),
    phone: String(c.phone ?? ""),
    name: c.name ? String(c.name) : null,
    is_active: Boolean(c.is_active ?? true),
    is_admin: Boolean(c.is_admin ?? false),
    created_at: String(c.created_at ?? ""),
  };
}

/** Loads and paginates the admin customer list with optional phone search. */
export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback((p: number, q: string) => {
    setLoading(true);
    getAdminCustomers(p, q)
      .then((raw) => {
        const r = raw as unknown as Record<string, unknown> & { items?: unknown[] };
        setTotal(Number(r.total ?? 0));
        setCustomers(((r.items ?? []) as Array<Record<string, unknown>>).map(mapCustomer));
        setPage(p);
      })
      .catch(() => { setCustomers([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(1, ""); }, [load]);

  const submitSearch = useCallback(() => load(1, search), [load, search]);
  const goToPage = useCallback((p: number) => load(p, search), [load, search]);

  return {
    customers, total, page, search, setSearch, loading,
    totalPages: Math.ceil(total / PAGE_SIZE),
    submitSearch, goToPage,
    reload: () => load(page, search),
  };
}
