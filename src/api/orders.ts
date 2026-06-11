import { apiFetch } from './client';
import type { Order, OrderItem, CreateOrderResponse } from '../types/orders';

/** Creates a new order from cart items. */
export async function createOrder(items: OrderItem[], totalAmount: number): Promise<CreateOrderResponse> {
  return apiFetch('/shop/orders', {
    method: 'POST',
    body: JSON.stringify({ items, total_amount: totalAmount }),
  });
}

/** Fetches a single order by ID. */
export async function getOrder(orderId: string): Promise<Order> {
  return apiFetch(`/shop/orders/${orderId}`);
}

/** Returns all orders placed by the authenticated user. */
export async function listMyOrders(): Promise<Order[]> {
  return apiFetch('/shop/me/orders');
}
