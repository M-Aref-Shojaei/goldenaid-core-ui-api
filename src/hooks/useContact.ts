"use client";


import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers/AuthProvider";
import { createContactSubmission } from "../api/contact";
import { ApiError, getErrorMessage } from "../api/client";

function toErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return getErrorMessage(err);
  return "خطا در ارسال پیام. لطفاً دوباره تلاش کنید.";
}

/** Contact form field values. */
export interface ContactForm {
  name: string;
  phone: string;
  message: string;
}

const EMPTY_FORM: ContactForm = { name: "", phone: "", message: "" };

/** Manages the contact form state, pre-fills phone from auth, and persists submissions via the BFF. */
export function useContact() {
  const router = useRouter();
  const { isAuthenticated, phone } = useAuth();
  const [form, setForm] = useState<ContactForm>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && phone) setForm((prev) => ({ ...prev, phone }));
  }, [isAuthenticated, phone]);

  const setField = useCallback(
    <K extends keyof ContactForm>(key: K, value: ContactForm[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isAuthenticated) {
        try { sessionStorage.setItem("redirectAfterLogin", "/contact"); } catch { /* noop */ }
        router.push("/auth/login");
        return;
      }
      setError(null);
      setSubmitting(true);
      try {
        await createContactSubmission(form);
        setSubmitted(true);
      } catch (err) {
        setError(toErrorMessage(err));
      } finally {
        setSubmitting(false);
      }
    },
    [isAuthenticated, router, form],
  );

  const reset = useCallback(() => {
    setSubmitted(false);
    setError(null);
    setForm(EMPTY_FORM);
  }, []);

  return { form, setField, submitted, submitting, error, handleSubmit, reset };
}
