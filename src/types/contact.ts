/** Request body for submitting the public contact form. */
export interface CreateContactSubmissionInput {
  name: string;
  phone: string;
  message: string;
}

/** A contact-us submission as stored and returned by the BFF. */
export interface ContactSubmission {
  id: string;
  name: string;
  phone: string;
  message: string;
  user_id?: string | null;
  status: 'NEW' | 'REVIEWED';
  created_at: string;
}
