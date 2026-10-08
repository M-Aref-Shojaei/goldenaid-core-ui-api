import { apiFetch } from './client';
import type {
  ProductDetail,
  ProductSummary,
  AdminProductListResponse,
  Category,
  CategoryListResponse,
  ProductVariant,
  ProductGroup,
  ProductStatusTab,
  ProductNameCheckResponse,
  QuickAddProductInput,
  QuickAddProductResult,
} from '../types/catalog';

/** Returns a paginated list of products for the public storefront. `includePosOnly`
 *  (staff token only, the POS feed) also lists POS-only and pending-invoice products. */
export async function listProducts(
  limit = 50,
  offset = 0,
  activeOnly = true,
  includePosOnly = false,
): Promise<{ items: ProductSummary[]; total: number }> {
  const pos = includePosOnly ? '&include_pos_only=true' : '';
  return apiFetch(`/products?limit=${limit}&offset=${offset}&active_only=${activeOnly}${pos}`);
}

/** Returns every product category, used to power storefront filters and admin forms. */
export async function listCategories(): Promise<Category[]> {
  const res = await apiFetch<CategoryListResponse>('/categories');
  return res.items;
}

/** Returns a single product with full detail (images etc.) by ID, optionally scoped to a variant. */
export async function getProduct(id: string, variantId?: string): Promise<ProductDetail> {
  const qs = variantId ? `?variant_id=${encodeURIComponent(variantId)}` : '';
  return apiFetch(`/products/${id}${qs}`);
}

/** Returns a paginated admin product list (max limit 500). Optional filters, all ANDed:
 *  search, active status, admin-only `group` (`none` = ungrouped), status tab,
 *  `sellable`, `created_from_invoice_id`; `counts` adds `status_counts` (TASK-351). */
export async function adminListProducts(params?: {
  skip?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
  group?: ProductGroup | 'none';
  status?: ProductStatusTab;
  sellable?: boolean;
  created_from_invoice_id?: string;
  counts?: boolean;
}): Promise<AdminProductListResponse> {
  const qp = new URLSearchParams();
  if (params?.skip !== undefined) qp.set('skip', String(params.skip));
  if (params?.limit !== undefined) qp.set('limit', String(params.limit));
  if (params?.search) qp.set('search', params.search);
  if (params?.is_active !== undefined) qp.set('is_active', String(params.is_active));
  if (params?.group) qp.set('group', params.group);
  if (params?.status) qp.set('status', params.status);
  if (params?.sellable !== undefined) qp.set('sellable', String(params.sellable));
  if (params?.created_from_invoice_id) qp.set('created_from_invoice_id', params.created_from_invoice_id);
  if (params?.counts) qp.set('counts', 'true');
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

/** Existing products whose normalized title (ي/ك, digits, ZWNJ, spacing, case
 *  folded — same as `normalizeSearchText`) equals `title`'s. Never cached. */
export async function adminCheckProductName(title: string, excludeId?: string): Promise<ProductNameCheckResponse> {
  const qp = new URLSearchParams({ title });
  if (excludeId) qp.set('exclude_id', excludeId);
  return apiFetch(`/admin/products/name-check?${qp.toString()}`);
}

/** Creates a product from a supplier-invoice line (name + optional SKU/group).
 *  The server sets price 1, pending-invoice and POS-only; no price is sent.
 *  Throws 409 `DUPLICATE_NAME` (`details.matches`), 400 `DUPLICATE_PRODUCT` (SKU). */
export async function adminQuickAddProduct(input: QuickAddProductInput): Promise<QuickAddProductResult> {
  const body: Record<string, unknown> = { title: input.title, created_from_invoice_id: input.created_from_invoice_id };
  if (input.sku?.trim()) body.sku = input.sku.trim();
  if (input.group) body.group = input.group;
  return apiFetch('/admin/products', { method: 'POST', body: JSON.stringify(body) });
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

/** Creates a new variant (size/side/etc.) for a product. */
export async function adminCreateVariant(
  productId: string,
  data: { attributes: Record<string, string>; sort_order?: number },
): Promise<ProductVariant> {
  return apiFetch(`/admin/products/${productId}/variants`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Updates an existing product variant. */
export async function adminUpdateVariant(
  productId: string,
  variantId: string,
  data: Partial<{ attributes: Record<string, string>; sort_order: number }>,
): Promise<ProductVariant> {
  return apiFetch(`/admin/products/${productId}/variants/${variantId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/** Deletes a product variant by ID. */
export async function adminDeleteVariant(productId: string, variantId: string): Promise<void> {
  return apiFetch(`/admin/products/${productId}/variants/${variantId}`, { method: 'DELETE' });
}
