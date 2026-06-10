export type OrderStatus =
  | 'SUBMITTED'
  | 'RESERVED'
  | 'AWAITING_PAYMENT'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'PAYMENT_FAILED'
  | 'CANCELLED';

export interface OrderItem {
  product_id: string;
  qty: number;
}

export interface OrderItemDetail {
  item_id: string;
  product_id: string;
  title: string;
  unit_price: number;
  qty: number;
  subtotal: number;
}

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

export interface CreateOrderInput {
  items: OrderItem[];
  total_amount: number;
}

export interface CreateOrderResponse {
  order_id: string;
  status: string;
  message?: string;
}

export interface CartItem {
  product_id: string;
  title: string;
  base_price: number;
  qty: number;
  thumbnail_url: string | null;
}

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
