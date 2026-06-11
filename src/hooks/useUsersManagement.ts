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
      // TODO: replace with api call when endpoint is available
      const mockUsers: AdminUser[] = [
        { user_id: "1", phone: "09121234567", name: "علی احمدی", role: "admin", created_at: "2026-01-15" },
        { user_id: "2", phone: "09129876543", name: "سارا محمدی", role: "manager", created_at: "2026-02-20" },
        { user_id: "3", phone: "09123456789", role: "user", created_at: "2026-03-10" },
        { user_id: "4", phone: "09127654321", name: "رضا کریمی", role: "user", created_at: "2026-04-05" },
      ];
      setUsers(mockUsers);
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
      // TODO: replace with api call
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
