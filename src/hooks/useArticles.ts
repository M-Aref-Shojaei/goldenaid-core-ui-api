"use client";

import { useEffect, useMemo, useState } from "react";
import { getPublishedArticles } from "../api/articles";
import type { Article } from "../types/catalog";

/** Fetches published articles and provides client-side search filtering. */
export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const reload = async () => {
    setLoading(true);
    try {
      setArticles(await getPublishedArticles());
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { reload(); }, []);

  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return articles;
    return articles.filter((a) => a.title.includes(q) || a.excerpt.includes(q));
  }, [articles, searchQuery]);

  return { articles, filteredArticles, loading, searchQuery, setSearchQuery, reload };
}
