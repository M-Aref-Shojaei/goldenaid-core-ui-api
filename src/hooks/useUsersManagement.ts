"use client";


import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers/AuthProvider";
import type { AdminUser, UserRole } from "../types/admin";

/** Loads and manages admin users list — currently uses mock data pending real endpoint. */
export function useUsersManagement() {
  const router = useRouter();
  const { isAuthenticated, isFullAdmin } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [promotingUserId, setPromotingUserId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Stub: /admin/users endpoint not yet implemented on the backend.
      // Replace with: const data = await apiFetch<AdminUser[]>('/admin/users');
      const data: AdminUser[] = [];
      setUsers(data);
    } catch {
      setError("خطا در بارگذاری کاربران");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/auth/login"); return; }
    if (!isFullAdmin) { router.push("/dashboard"); return; }
    loadUsers();
  }, [isAuthenticated, isFullAdmin, loadUsers, router]);

  const promoteUser = useCallback(async (userId: string, newRole: UserRole) => {
    setPromotingUserId(userId);
    setError("");
    try {
      // Stub: /admin/users/:id/role endpoint not yet implemented on the backend.
      // Replace with: await apiFetch(`/admin/users/${userId}/role`, { method: 'PATCH', body: JSON.stringify({ role: newRole }) });
      setUsers((prev) => prev.map((u) => (u.user_id === userId ? { ...u, role: newRole } : u)));
    } catch {
      setError("خطا در ارتقای کاربر");
    } finally {
      setPromotingUserId(null);
    }
  }, []);

  const filteredUsers = users.filter((u) => !searchPhone || u.phone.includes(searchPhone));

  return { loading, error, searchPhone, setSearchPhone, promotingUserId, filteredUsers, promoteUser };
}
