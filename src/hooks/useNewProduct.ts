"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminCreateProduct } from "../api/catalog";
import { ApiError } from "../api/client";

/** Form field values for creating a new product. */
export interface NewProductForm {
  title: string;
  subtitle: string;
  sku: string;
  base_price: string;
  currency: string;
  short_description: string;
  description: string;
  is_active: boolean;
  image_url: string;
}

const INITIAL: NewProductForm = {
  title: "", subtitle: "", sku: "", base_price: "",
  currency: "IRR", short_description: "", description: "",
  is_active: true, image_url: "",
};

function parseApiError(err: unknown): string {
  if (err instanceof ApiError) {
    try {
      const data = JSON.parse(err.message);
      return data.detail || data.message || "خطا در ایجاد محصول";
    } catch {
      if (err.status === 401) return "لطفاً دوباره وارد شوید";
      if (err.status === 403) return "شما دسترسی به این بخش ندارید";
      return err.message || "خطا در ایجاد محصول";
    }
  }
  return (err as Error)?.message || "خطا در ایجاد محصول";
}

/** Manages the new product form state, image upload, and submission. */
export function useNewProduct() {
  const router = useRouter();
  const [form, setForm] = useState<NewProductForm>(INITIAL);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setField = <K extends keyof NewProductForm>(key: K, value: NewProductForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleImageUpload = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    setField("image_url", URL.createObjectURL(file));
  };

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      await adminCreateProduct({ ...form, base_price: parseInt(form.base_price) });
      router.push("/admin/products");
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return { form, setField, imagePreview, handleImageUpload, loading, error, submit, goBack: () => router.back() };
}
