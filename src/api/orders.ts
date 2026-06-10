import { apiFetch } from './client';
import type { Order, OrderItem, CreateOrderResponse } from '../types/orders';

export async function createOrder(items: OrderItem[], totalAmount: number): Promise<CreateOrderResponse> {
  return apiFetch('/shop/orders', {
    method: 'POST',
    body: JSON.stringify({ items, total_amount: totalAmount }),
  });
}

export async function getOrder(orderId: string): Promise<Order> {
  return apiFetch(`/shop/orders/${orderId}`);
}

export async function listMyOrders(): Promise<Order[]> {
  return apiFetch('/shop/me/orders');
}
