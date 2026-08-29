"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminCreateProduct } from "../api/catalog";
import { adminUploadProductImage, adminAttachProductImage } from "../api/admin";
import { ApiError } from "../api/client";
import { useToast } from "../components/Toast";

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
}

const INITIAL: NewProductForm = {
  title: "", subtitle: "", sku: "", base_price: "",
  currency: "IRR", short_description: "", description: "",
  is_active: true,
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
  const { toast } = useToast();
  const [form, setForm] = useState<NewProductForm>(INITIAL);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setField = <K extends keyof NewProductForm>(key: K, value: NewProductForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // The product doesn't exist yet, so there's no ID to upload/attach the
  // image to. Hold onto the file and preview it locally (data URL, never
  // sent to the server) — the real upload + attach happens in `submit`,
  // once we have a product_id.
  const handleImageUpload = (file: File | null) => {
    if (!file) return;
    setPendingImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const { product_id } = await adminCreateProduct({ ...form, base_price: parseInt(form.base_price) });
      if (pendingImageFile) {
        try {
          const uploaded = await adminUploadProductImage(product_id, pendingImageFile);
          await adminAttachProductImage(product_id, { url: uploaded.image_url });
        } catch {
          // Product was created successfully — a failed image attach isn't
          // worth blocking on, but it shouldn't be silent either.
          toast(
            "محصول ایجاد شد اما آپلود تصویر ناموفق بود — می‌توانید آن را از صفحه ویرایش اضافه کنید",
            "warning",
          );
        }
      }
      router.push("/products");
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return { form, setField, imagePreview, handleImageUpload, loading, error, submit, goBack: () => router.back() };
}
