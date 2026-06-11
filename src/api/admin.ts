import { apiFetch } from './client';
import { API_CONFIG, STORAGE_KEYS } from './config';
import type { AdminStats, CustomerListResponse, ImportResult } from '../types/admin';

/** Returns high-level dashboard statistics (users, campaigns, SMS sent). */
export async function getAdminStats(): Promise<AdminStats> {
  return apiFetch('/admin/stats');
}

/** Returns a paginated customer list, optionally filtered by phone search query. */
export async function getAdminCustomers(page = 1, q = ''): Promise<CustomerListResponse> {
  const qp = new URLSearchParams();
  qp.set('page', String(page));
  if (q) qp.set('q', q);
  return apiFetch(`/admin/customers?${qp.toString()}`);
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

/** Returns all orders for the admin panel. */
export async function getAdminOrders(): Promise<unknown[]> {
  return apiFetch('/admin/orders');
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
  const token = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.TOKEN) : null;
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/api\/v1\/?$/, '');
  const url = `${baseUrl}/api/v1/admin/products/import?skip_duplicates=${skipDuplicates}`;

  const formData = new FormData();
  const blob = new Blob([csvContent], { type: 'text/csv' });
  formData.append('file', blob, 'products.csv');

  const res = await fetch(url, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const parsed = JSON.parse(text);
      message = parsed.detail || text;
    } catch { /* text is already the message */ }
    throw new Error(`Import failed: ${res.status} ${message}`);
  }

  return res.json();
}
