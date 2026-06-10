import { apiFetch } from './client';
import type { ProductDetail, ProductSummary, AdminProductListResponse } from '../types/catalog';

export async function listProducts(limit = 50, offset = 0, activeOnly = true): Promise<{ items: ProductSummary[]; total: number }> {
  return apiFetch(`/products?limit=${limit}&offset=${offset}&active_only=${activeOnly}`);
}

export async function getProduct(id: string): Promise<ProductDetail> {
  return apiFetch(`/products/${id}`);
}

export async function adminListProducts(params?: {
  skip?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
}): Promise<AdminProductListResponse> {
  const qp = new URLSearchParams();
  if (params?.skip !== undefined) qp.set('skip', String(params.skip));
  if (params?.limit !== undefined) qp.set('limit', String(params.limit));
  if (params?.search) qp.set('search', params.search);
  if (params?.is_active !== undefined) qp.set('is_active', String(params.is_active));
  const qs = qp.toString();
  return apiFetch(`/admin/products${qs ? '?' + qs : ''}`);
}

export async function adminGetProduct(id: string): Promise<ProductDetail> {
  return apiFetch(`/admin/products/${id}`);
}

export async function adminCreateProduct(data: {
  title: string;
  subtitle?: string;
  sku?: string;
  base_price: number;
  currency?: string;
  short_description?: string;
  description?: string;
  is_active?: boolean;
  image_url?: string;
}): Promise<{ product_id: string }> {
  return apiFetch('/admin/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function adminUpdateProduct(id: string, data: Record<string, unknown>): Promise<{ product_id: string; message: string }> {
  return apiFetch(`/admin/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function adminDeleteProduct(id: string): Promise<{ message: string }> {
  return apiFetch(`/admin/products/${id}`, { method: 'DELETE' });
}
