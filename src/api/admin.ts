import { apiFetch } from './client';
import { API_CONFIG, STORAGE_KEYS } from './config';
import type { AdminStats, CustomerListResponse, ImportResult } from '../types/admin';

export async function getAdminStats(): Promise<AdminStats> {
  return apiFetch('/admin/stats');
}

export async function getAdminCustomers(page = 1, q = ''): Promise<CustomerListResponse> {
  const qp = new URLSearchParams();
  qp.set('page', String(page));
  if (q) qp.set('q', q);
  return apiFetch(`/admin/customers?${qp.toString()}`);
}

export async function sendManualSms(phones: string[], message: string): Promise<{ sent: number; failed: number }> {
  return apiFetch('/admin/customers/sms', {
    method: 'POST',
    body: JSON.stringify({ phones, message }),
  });
}

export async function getCampaigns(): Promise<unknown[]> {
  return apiFetch('/admin/campaigns');
}

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

export async function getCampaign(id: string): Promise<unknown> {
  return apiFetch(`/admin/campaigns/${id}`);
}

export async function sendCampaign(id: string): Promise<{ sent: number; failed: number; status: string }> {
  return apiFetch(`/admin/campaigns/${id}/send`, { method: 'POST' });
}

export async function getAdminOrders(): Promise<unknown[]> {
  return apiFetch('/admin/orders');
}

export async function sendOrderSms(orderId: string, message: string): Promise<{ phone: string; sent: number; failed: number }> {
  return apiFetch(`/admin/orders/${orderId}/sms`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

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
