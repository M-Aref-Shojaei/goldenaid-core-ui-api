"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers/AuthProvider";
import { createArticle } from "../api/articles";
import { getErrorMessage, ApiError } from "../api/client";

export interface NewArticleForm {
  title: string;
  excerpt: string;
  content: string;
  status: "draft" | "published";
}

const EMPTY_ARTICLE_FORM: NewArticleForm = { title: "", excerpt: "", content: "", status: "draft" };

export function useNewArticle() {
  const router = useRouter();
  const { isAuthenticated, isManagerOrAdmin, userName, phone } = useAuth();
  const [form, setForm] = useState<NewArticleForm>(EMPTY_ARTICLE_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const allowed = isAuthenticated && isManagerOrAdmin;

  useEffect(() => { if (!allowed) router.push("/auth/login"); }, [allowed, router]);

  const setField = <K extends keyof NewArticleForm>(key: K, value: NewArticleForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createArticle(form);
      router.push("/admin/articles");
    } catch (err) {
      setError(getErrorMessage(err as ApiError));
    } finally {
      setLoading(false);
    }
  };

  const cancel = () => router.back();

  return { form, setField, loading, error, allowed, author: userName || phone, submit, cancel };
}
