import { apiFetch } from './client';
import type { Address } from '../types/addresses';

/** Returns all saved delivery addresses for the authenticated user. */
export async function listAddresses(): Promise<Address[]> {
  const response = await apiFetch<{ addresses: Address[] }>('/addresses');
  return response.addresses;
}

/** Deletes a saved address by ID. */
export async function deleteAddress(id: number): Promise<void> {
  await apiFetch(`/addresses/${id}`, { method: 'DELETE' });
}
