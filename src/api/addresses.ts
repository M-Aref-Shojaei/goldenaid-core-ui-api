import { apiFetch } from './client';
import type { Address, CreateAddressPayload } from '../types/addresses';
import type { AddressFormData } from '../components/forms/AddressFields';

/** Returns all saved delivery addresses for the authenticated user. */
export async function listAddresses(): Promise<Address[]> {
  const response = await apiFetch<{ addresses: Address[] }>('/addresses');
  return response.addresses;
}

/**
 * Creates a new delivery address.
 *
 * Maps the form's field names (`label`, `phone`) to core-bff's
 * `CreateAddressRequest` DTO field names (`title`, `recipient_phone`) —
 * these deliberately differ, so sending the raw form object directly
 * fails with a 422 (missing required fields).
 */
export async function createAddress(form: AddressFormData): Promise<Address> {
  const payload: CreateAddressPayload = {
    title: form.label,
    recipient_name: form.recipient_name,
    recipient_phone: form.phone,
    province: form.province,
    city: form.city,
    address: form.address,
    postal_code: form.postal_code,
    is_default: form.is_default,
  };
  return apiFetch<Address>('/addresses', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** Deletes a saved address by ID. */
export async function deleteAddress(id: number): Promise<void> {
  await apiFetch(`/addresses/${id}`, { method: 'DELETE' });
}
