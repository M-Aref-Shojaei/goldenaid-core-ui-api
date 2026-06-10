"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers/AuthProvider";
import { getAllArticles, deleteArticle as apiDeleteArticle, updateArticle } from "../api/articles";
import { getErrorMessage, ApiError } from "../api/client";
import type { Article } from "../types/catalog";

export type ArticleStatusFilter = "all" | Article["status"];

function matchesFilters(article: Article, search: string, status: ArticleStatusFilter): boolean {
  const matchesSearch = !search || article.title.includes(search) || article.excerpt.includes(search);
  const matchesStatus = status === "all" || article.status === status;
  return matchesSearch && matchesStatus;
}

export function useArticlesManagement() {
  const router = useRouter();
  const { isAuthenticated, isManagerOrAdmin } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<ArticleStatusFilter>("all");

  async function reload() {
    setLoading(true);
    setError("");
    try { setArticles(await getAllArticles()); }
    catch (e) { setError(getErrorMessage(e as ApiError)); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    if (!isAuthenticated) { router.push("/auth/login"); return; }
    if (!isManagerOrAdmin) { router.push("/dashboard"); return; }
    reload();
  }, [isAuthenticated, isManagerOrAdmin]);

  async function deleteArticle(id: string) {
    if (!confirm("آیا از حذف این مقاله اطمینان دارید؟")) return;
    try {
      await apiDeleteArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (e) { setError(getErrorMessage(e as ApiError)); }
  }

  async function toggleStatus(id: string, current: Article["status"]) {
    const next: Article["status"] = current === "published" ? "draft" : "published";
    try {
      await updateArticle(id, { status: next });
      setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, status: next } : a)));
    } catch (e) { setError(getErrorMessage(e as ApiError)); }
  }

  const filteredArticles = useMemo(
    () => articles.filter((a) => matchesFilters(a, searchQuery, filterStatus)),
    [articles, searchQuery, filterStatus],
  );

  return { articles: filteredArticles, loading, error, searchQuery, setSearchQuery, filterStatus, setFilterStatus, deleteArticle, toggleStatus, reload };
}
