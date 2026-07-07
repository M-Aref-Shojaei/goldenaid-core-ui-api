"use client";

import { useCallback, useEffect, useState } from "react";
import {
  adminListContactSubmissions,
  adminUpdateContactSubmission,
} from "../api/contact";
import type { ContactSubmission } from "../types/contact";

/** Loads the admin contact-submission review queue and lets managers mark items reviewed. */
export function useContactSubmissions() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    adminListContactSubmissions()
      .then(setSubmissions)
      .catch(() => setError("خطا در دریافت پیام‌ها"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const markReviewed = useCallback(async (id: string) => {
    const updated = await adminUpdateContactSubmission(id, "REVIEWED");
    setSubmissions((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }, []);

  return { submissions, loading, error, reload: load, markReviewed };
}
