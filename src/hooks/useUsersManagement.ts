"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers/AuthProvider";
import { getAdminUsers, setUserRole } from "../api/admin";
import type { AdminUser, UserRole } from "../types/admin";

const PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 300;

/** Loads and manages the admin users list — server-side search and role assignment. */
export function useUsersManagement() {
  const router = useRouter();
  const { isAuthenticated, isFullAdmin } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [promotingUserId, setPromotingUserId] = useState<string | null>(null);
  const isFirstRun = useRef(true);

  const loadUsers = useCallback(async (q: string) => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminUsers(0, PAGE_SIZE, q);
      setUsers(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setError("خطا در بارگذاری کاربران");
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (!isFullAdmin) {
      router.push("/");
      return;
    }

    // Load immediately on mount / auth change; debounce subsequent search typing
    // (the search box has no submit button — it filters as the admin types).
    if (isFirstRun.current) {
      isFirstRun.current = false;
      loadUsers(searchPhone);
      return;
    }
    const timer = setTimeout(() => loadUsers(searchPhone), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchPhone, isAuthenticated, isFullAdmin]);

  const promoteUser = useCallback(async (userId: string, newRole: UserRole) => {
    setPromotingUserId(userId);
    setError("");
    try {
      await setUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.user_id === userId ? { ...u, role: newRole } : u)));
    } catch {
      setError("خطا در تغییر نقش کاربر");
    } finally {
      setPromotingUserId(null);
    }
  }, []);

  return {
    loading,
    error,
    searchPhone,
    setSearchPhone,
    promotingUserId,
    filteredUsers: users,
    total,
    promoteUser,
  };
}
