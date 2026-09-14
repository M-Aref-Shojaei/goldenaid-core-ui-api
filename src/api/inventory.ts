import { apiFetch } from './client';
import type { ExpiringSoonBatch, StockBatch, StockItem } from '../types/catalog';

/** Creates a new stock batch for a product (optionally scoped to a variant). */
export async function adminCreateBatch(data: {
  product_id: string;
  variant_id?: string;
  quantity?: number;
  expiry_date?: string;
  code?: string;
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

/** Returns stock batches expiring within the given number of days, each enriched
 * with its product/variant title for display. */
export async function adminListExpiringSoonBatches(days = 30): Promise<ExpiringSoonBatch[]> {
  return apiFetch(`/admin/stock/batches/expiring-soon?days=${days}`);
}

/** Updates an existing stock batch (quantity and/or expiry date). */
export async function adminUpdateBatch(
  batchId: string,
  data: Partial<{ quantity: number; expiry_date: string; code: string }>,
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

/** Returns current available stock (one row per variant) for a product. */
export async function adminGetStockItems(productId: string): Promise<StockItem[]> {
  return apiFetch(`/admin/stock/items?product_id=${encodeURIComponent(productId)}`);
}

/**
 * Returns current available stock for *every* product, one row per
 * (product, variant), in a single request.
 *
 * POS shows a stock count on every card and holds the whole catalogue, so
 * asking per product would mean one HTTP request per product on every page
 * load.
 */
export async function adminGetAllStockItems(): Promise<StockItem[]> {
  return apiFetch('/admin/stock/items');
}

/**
 * Sets (or, with `online_allocated_qty: null`, clears back to the 80%
 * default) the admin override for how much of a (product, variant)'s stock
 * is sellable online. Returns the updated stock row.
 */
export async function adminSetOnlineAllocation(payload: {
  product_id: string;
  variant_id: string | null;
  online_allocated_qty: number | null;
}): Promise<StockItem> {
  return apiFetch('/admin/stock/items/online-allocation', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
