"use client";


import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers/AuthProvider";
import { updateProfile } from "../api/auth";

/** Success or error feedback shown after a profile update. */
export interface ProfileMessage {
  type: "success" | "error";
  text: string;
}

const REDIRECT_DELAY_MS = 1500;

/** Manages the profile name edit form: submit, update auth state, and redirect. */
export function useProfile() {
  const router = useRouter();
  const { phone, userName, updateUserName } = useAuth();
  const [name, setName] = useState(userName || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<ProfileMessage | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setMessage({ type: "error", text: "لطفاً نام خود را وارد کنید" }); return; }
    setSaving(true);
    setMessage(null);
    try {
      await updateProfile(name.trim());
      updateUserName(name.trim());
      setMessage({ type: "success", text: "نام شما با موفقیت ذخیره شد" });
      setTimeout(() => router.push("/dashboard"), REDIRECT_DELAY_MS);
    } catch (error: unknown) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "خطا در ذخیره اطلاعات. لطفاً دوباره تلاش کنید" });
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => router.push("/dashboard");

  return { phone: phone || "", name, setName, saving, message, handleSubmit, cancel };
}
