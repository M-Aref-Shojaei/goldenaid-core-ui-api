import { apiFetch } from './client';

/** Response from the create-payment endpoint — includes the Zarinpal redirect URL. */
export interface CreatePaymentResponse {
  payment_id: string;
  authority: string;
  payment_url: string;
}

/**
 * Initiates a Zarinpal payment for an order and returns the redirect URL.
 *
 * No amount is sent: the backend always derives the charge from the order's
 * real total (Sales' authoritative record), never from client input.
 */
export async function createPayment(orderId: string): Promise<CreatePaymentResponse> {
  return apiFetch('/shop/payments', {
    method: 'POST',
    body: JSON.stringify({ order_id: orderId }),
  });
}
