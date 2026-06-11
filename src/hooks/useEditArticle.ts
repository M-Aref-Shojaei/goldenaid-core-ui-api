"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers/AuthProvider";
import { getArticleById, updateArticle } from "../api/articles";
import { getErrorMessage, ApiError } from "../api/client";
import type { Article } from "../types/catalog";

export interface EditArticleForm {
  title: string;
  excerpt: string;
  content: string;
  status: "draft" | "published";
}

/** Hook for loading and editing an existing article by ID. */
export function useEditArticle(id: string) {
  const router = useRouter();
  const { isAuthenticated, isWriterOrAdmin } = useAuth();
  const [form, setFormState] = useState<EditArticleForm>({ title: "", excerpt: "", content: "", status: "draft" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) { router.push("/auth/login"); return; }
    if (!isWriterOrAdmin) { router.push("/dashboard"); return; }

    getArticleById(id)
      .then((a: Article) => setFormState({ title: a.title, excerpt: a.excerpt, content: a.content, status: a.status }))
      .catch((e: ApiError) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [id, isAuthenticated, isWriterOrAdmin]);

  const setField = <K extends keyof EditArticleForm>(key: K, value: EditArticleForm[K]) =>
    setFormState((prev) => ({ ...prev, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await updateArticle(id, form);
      router.push("/admin/articles");
    } catch (err) {
      setError(getErrorMessage(err as ApiError));
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => router.back();

  return { form, setField, loading, saving, error, submit, cancel };
}
