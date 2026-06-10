import { apiFetch } from './client';
import type { Address } from '../types/addresses';

export async function listAddresses(): Promise<Address[]> {
  const response = await apiFetch<{ addresses: Address[] }>('/addresses');
  return response.addresses;
}

export async function deleteAddress(id: number): Promise<void> {
  await apiFetch(`/addresses/${id}`, { method: 'DELETE' });
}
