"use client";


import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers/AuthProvider";

/** Contact form field values. */
export interface ContactForm {
  name: string;
  phone: string;
  message: string;
}

const EMPTY_FORM: ContactForm = { name: "", phone: "", message: "" };

/** Manages the contact form state, pre-fills phone from auth, and handles submission. */
export function useContact() {
  const router = useRouter();
  const { isAuthenticated, phone } = useAuth();
  const [form, setForm] = useState<ContactForm>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isAuthenticated && phone) setForm((prev) => ({ ...prev, phone }));
  }, [isAuthenticated, phone]);

  const setField = useCallback(
    <K extends keyof ContactForm>(key: K, value: ContactForm[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!isAuthenticated) {
        try { sessionStorage.setItem("redirectAfterLogin", "/contact"); } catch { /* noop */ }
        router.push("/auth/login");
        return;
      }
      setSubmitted(true);
    },
    [isAuthenticated, router],
  );

  const reset = useCallback(() => { setSubmitted(false); setForm(EMPTY_FORM); }, []);

  return { form, setField, submitted, handleSubmit, reset };
}
