import { apiFetch, apiFetchFormData } from './client';
import type {
  AdminOrder,
  AdminStats,
  CampaignAnalytics,
  CustomerListResponse,
  ImportResult,
  RecentActivityResponse,
  SupplierInvoice,
  SupplierInvoiceCreate,
  SupplierInvoiceDetail,
  UserListResponse,
  UserRole,
} from '../types/admin';

/** Returns high-level dashboard statistics (users, campaigns, SMS sent). */
export async function getAdminStats(): Promise<AdminStats> {
  return apiFetch('/admin/stats');
}

/** Returns the most recent admin-relevant activity events (product updates, new orders). */
export async function getRecentActivity(limit = 10): Promise<RecentActivityResponse> {
  return apiFetch(`/admin/activity/recent?limit=${limit}`);
}

/** Returns a paginated customer list, optionally filtered by phone search query. */
export async function getAdminCustomers(page = 1, q = ''): Promise<CustomerListResponse> {
  const qp = new URLSearchParams();
  qp.set('page', String(page));
  if (q) qp.set('q', q);
  return apiFetch(`/admin/customers?${qp.toString()}`);
}

/** Returns a paginated user list, optionally filtered by phone or name search query. */
export async function getAdminUsers(skip = 0, limit = 50, q = ''): Promise<UserListResponse> {
  const qp = new URLSearchParams();
  qp.set('skip', String(skip));
  qp.set('limit', String(limit));
  if (q) qp.set('q', q);
  return apiFetch(`/admin/users?${qp.toString()}`);
}

/** Sets a user's role (admin only). Returns the backend's updated-user response. */
export async function setUserRole(
  userId: string,
  role: UserRole,
): Promise<{ role: UserRole; message: string }> {
  return apiFetch(`/admin/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
}

/** Sends a manual SMS to a list of phone numbers. */
export async function sendManualSms(phones: string[], message: string): Promise<{ sent: number; failed: number }> {
  return apiFetch('/admin/customers/sms', {
    method: 'POST',
    body: JSON.stringify({ phones, message }),
  });
}

/** Returns all SMS campaigns. */
export async function getCampaigns(): Promise<unknown[]> {
  return apiFetch('/admin/campaigns');
}

/** Creates a new SMS campaign. */
export async function createCampaign(data: {
  name: string;
  message_text: string;
  recipient_filter: 'all' | string[];
}): Promise<{ id: string; total_count: number }> {
  return apiFetch('/admin/campaigns', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Returns a single campaign by ID. */
export async function getCampaign(id: string): Promise<unknown> {
  return apiFetch(`/admin/campaigns/${id}`);
}

/** Triggers sending for a DRAFT campaign. */
export async function sendCampaign(id: string): Promise<{ sent: number; failed: number; status: string }> {
  return apiFetch(`/admin/campaigns/${id}/send`, { method: 'POST' });
}

/** Returns aggregate delivery analytics (sent/failed/pending, failure breakdown) for a campaign. */
export async function getCampaignAnalytics(id: string): Promise<CampaignAnalytics> {
  return apiFetch(`/admin/campaigns/${id}/analytics`);
}

/** Returns all orders for the admin panel. */
export async function getAdminOrders(): Promise<unknown[]> {
  return apiFetch('/admin/orders');
}

/** Returns a single order by ID for the admin panel (admin-gated). */
export async function getAdminOrder(orderId: string): Promise<AdminOrder> {
  return apiFetch(`/admin/orders/${orderId}`);
}

/** Sends an SMS notification about a specific order. */
export async function sendOrderSms(orderId: string, message: string): Promise<{ phone: string; sent: number; failed: number }> {
  return apiFetch(`/admin/orders/${orderId}/sms`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

/** Uploads a CSV and bulk-imports products, optionally skipping duplicates by SKU. */
export async function importProducts(csvContent: string, skipDuplicates: boolean): Promise<ImportResult> {
  const formData = new FormData();
  formData.append('file', new Blob([csvContent], { type: 'text/csv' }), 'products.csv');
  return apiFetchFormData<ImportResult>(`/admin/products/import?skip_duplicates=${skipDuplicates}`, formData);
}

/** Uploads a product image file to the catalog. */
export async function adminUploadProductImage(
  productId: string,
  file: File,
): Promise<{ success: boolean; image_url: string; filename: string; size: number }> {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetchFormData(`/admin/products/${productId}/upload-image`, formData);
}

/** Attaches an already-uploaded image URL to a product as a ProductImage. */
export async function adminAttachProductImage(
  productId: string,
  data: { url: string; alt?: string; sort_order?: number },
): Promise<{ id: string; url: string; alt: string | null; sort_order: number }> {
  return apiFetch(`/admin/products/${productId}/images`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Removes a ProductImage from a product. */
export async function adminRemoveProductImage(productId: string, imageId: string): Promise<void> {
  await apiFetch(`/admin/products/${productId}/images/${imageId}`, { method: 'DELETE' });
}

/** Lists supplier invoices, optionally restricted to a date range. */
export async function getSupplierInvoices(params?: {
  start_date?: string;
  end_date?: string;
}): Promise<SupplierInvoice[]> {
  const q = new URLSearchParams();
  if (params?.start_date) q.set('start_date', params.start_date);
  if (params?.end_date) q.set('end_date', params.end_date);
  const qs = q.toString();
  return apiFetch(`/admin/supplier-invoices${qs ? `?${qs}` : ''}`);
}

/** Gets one supplier invoice with its line items. */
export async function getSupplierInvoice(id: string): Promise<SupplierInvoiceDetail> {
  return apiFetch(`/admin/supplier-invoices/${id}`);
}

/** Creates a supplier invoice, its line items, and a stock batch per line. */
export async function createSupplierInvoice(data: SupplierInvoiceCreate): Promise<SupplierInvoiceDetail> {
  return apiFetch('/admin/supplier-invoices', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
