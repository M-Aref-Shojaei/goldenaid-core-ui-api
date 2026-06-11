/** All possible order lifecycle states. */
export type OrderStatus =
  | 'SUBMITTED'
  | 'RESERVED'
  | 'AWAITING_PAYMENT'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'PAYMENT_FAILED'
  | 'CANCELLED';

/** Line-item input when creating an order. */
export interface OrderItem {
  product_id: string;
  qty: number;
}

/** Fully-hydrated order line item returned by the API. */
export interface OrderItemDetail {
  item_id: string;
  product_id: string;
  title: string;
  unit_price: number;
  qty: number;
  subtotal: number;
}

/** Full order record returned by the API. */
export interface Order {
  id: string;
  order_id: string;
  status: OrderStatus;
  customer_id: string | null;
  items?: OrderItemDetail[];
  total_amount: number;
  created_at: string;
  updated_at?: string;
}

/** Payload for creating a new order. */
export interface CreateOrderInput {
  items: OrderItem[];
  total_amount: number;
}

/** Response from the create-order endpoint. */
export interface CreateOrderResponse {
  order_id: string;
  status: string;
  message?: string;
}

/** Cart item stored in `localStorage` and the `CartProvider`. */
export interface CartItem {
  product_id: string;
  title: string;
  base_price: number;
  qty: number;
  thumbnail_url: string | null;
}

/** Inventory stock-reservation record. */
export interface StockReservation {
  reservation_id: string;
  order_id: string;
  product_id: string;
  requested_qty: number;
  reserved_qty: number;
  status: 'ACCEPTED' | 'REJECTED';
  reason?: string;
  expires_at?: string;
}
