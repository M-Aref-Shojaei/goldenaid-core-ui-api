import { apiFetch } from './client';

export interface CreatePaymentResponse {
  payment_id: string;
  authority: string;
  payment_url: string;
}

export async function createPayment(orderId: string, amount: number): Promise<CreatePaymentResponse> {
  return apiFetch('/shop/payments', {
    method: 'POST',
    body: JSON.stringify({ order_id: orderId, amount }),
  });
}
