import { apiFetch } from './client';
import type { ContactSubmission, CreateContactSubmissionInput } from '../types/contact';

/** Submits the public contact form. Works for both anonymous and authenticated visitors. */
export async function createContactSubmission(
  data: CreateContactSubmissionInput,
): Promise<ContactSubmission> {
  return apiFetch('/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Lists all contact-us submissions (admin only). */
export async function adminListContactSubmissions(): Promise<ContactSubmission[]> {
  return apiFetch('/admin/contact');
}

/** Updates a submission's review status (admin only). */
export async function adminUpdateContactSubmission(
  id: string,
  status: 'NEW' | 'REVIEWED',
): Promise<ContactSubmission> {
  return apiFetch(`/admin/contact/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
