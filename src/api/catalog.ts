import { apiFetch } from './client';
import type { ProductDetail, ProductSummary, AdminProductListResponse } from '../types/catalog';

/** Returns a paginated list of products for the public storefront. */
export async function listProducts(limit = 50, offset = 0, activeOnly = true): Promise<{ items: ProductSummary[]; total: number }> {
  return apiFetch(`/products?limit=${limit}&offset=${offset}&active_only=${activeOnly}`);
}

/** Returns a single product with full detail (images etc.) by ID. */
export async function getProduct(id: string): Promise<ProductDetail> {
  return apiFetch(`/products/${id}`);
}

/** Returns a paginated admin product list, optionally filtered by search and active status. */
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

/** Returns the admin detail view of a single product by ID. */
export async function adminGetProduct(id: string): Promise<ProductDetail> {
  return apiFetch(`/admin/products/${id}`);
}

/** Creates a new product in the admin panel. */
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

/** Updates an existing product by ID. */
export async function adminUpdateProduct(id: string, data: Record<string, unknown>): Promise<{ product_id: string; message: string }> {
  return apiFetch(`/admin/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/** Deletes a product by ID. */
export async function adminDeleteProduct(id: string): Promise<{ message: string }> {
  return apiFetch(`/admin/products/${id}`, { method: 'DELETE' });
}
