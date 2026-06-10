"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCampaign } from "../api/admin";
import { getErrorMessage, ApiError } from "../api/client";

export type RecipientMode = "all" | "phones";

export function parsePhones(text: string): string[] {
  return text.split(/[\n,،\s]+/).map((p) => p.trim()).filter((p) => p.length >= 10);
}

export function useNewCampaign() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [recipientMode, setRecipientMode] = useState<RecipientMode>("all");
  const [phonesText, setPhonesText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const phoneList = parsePhones(phonesText);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("نام کمپین الزامی است");
    if (!message.trim()) return setError("متن پیامک الزامی است");
    if (recipientMode === "phones" && phoneList.length === 0) return setError("حداقل یک شماره وارد کنید");
    setSubmitting(true);
    try {
      const recipient_filter: "all" | string[] = recipientMode === "all" ? "all" : phoneList;
      const res = (await createCampaign({ name: name.trim(), message_text: message.trim(), recipient_filter })) as { id: string };
      router.push(`/admin/campaigns/${res.id}`);
    } catch (err) {
      setError(getErrorMessage(err as ApiError));
      setSubmitting(false);
    }
  }

  const cancel = () => router.push("/admin/campaigns");

  return { name, setName, message, setMessage, recipientMode, setRecipientMode, phonesText, setPhonesText, phoneList, submitting, error, handleSubmit, cancel };
}
