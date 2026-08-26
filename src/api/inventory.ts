import { apiFetch } from './client';
import type { StockBatch } from '../types/catalog';

/** Creates a new stock batch for a product (optionally scoped to a variant). */
export async function adminCreateBatch(data: {
  product_id: string;
  variant_id?: string;
  quantity?: number;
  expiry_date?: string;
}): Promise<StockBatch> {
  return apiFetch('/admin/stock/batches', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Returns every stock batch for a product. */
export async function adminListBatches(productId: string): Promise<StockBatch[]> {
  return apiFetch(`/admin/stock/batches?product_id=${encodeURIComponent(productId)}`);
}

/** Returns stock batches expiring within the given number of days. */
export async function adminListExpiringSoonBatches(days = 30): Promise<StockBatch[]> {
  return apiFetch(`/admin/stock/batches/expiring-soon?days=${days}`);
}

/** Updates an existing stock batch (quantity and/or expiry date). */
export async function adminUpdateBatch(
  batchId: string,
  data: Partial<{ quantity: number; expiry_date: string }>,
): Promise<StockBatch> {
  return apiFetch(`/admin/stock/batches/${batchId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/** Deletes a stock batch by ID. */
export async function adminDeleteBatch(batchId: string): Promise<void> {
  return apiFetch(`/admin/stock/batches/${batchId}`, { method: 'DELETE' });
}
