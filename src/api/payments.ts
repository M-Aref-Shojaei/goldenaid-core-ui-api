import { apiFetch } from './client';

/** Response from the create-payment endpoint — includes the Zarinpal redirect URL. */
export interface CreatePaymentResponse {
  payment_id: string;
  authority: string;
  payment_url: string;
}

/** Initiates a Zarinpal payment for an order and returns the redirect URL. */
export async function createPayment(orderId: string, amount: number): Promise<CreatePaymentResponse> {
  return apiFetch('/shop/payments', {
    method: 'POST',
    body: JSON.stringify({ order_id: orderId, amount }),
  });
}
