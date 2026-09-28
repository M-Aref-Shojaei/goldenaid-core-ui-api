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
  variant_id?: string;
  variant_label?: string;
}

/** Fully-hydrated order line item returned by the API. */
export interface OrderItemDetail {
  item_id: string;
  product_id: string;
  title: string;
  unit_price: number;
  qty: number;
  subtotal: number;
  variant_id?: string;
  variant_label?: string;
  /** POS-only: a free line given away, not charged (TASK-333). */
  is_gift?: boolean;
  /** User id who gave this gift line; set on create, kept across edits. */
  given_by?: string | null;
  /** Display name for `given_by`, enriched by core-bff. */
  given_by_name?: string | null;
  /** Free-form attribution, e.g. `{type, campaign_id}`; not shown in the UI. */
  source?: Record<string, unknown> | null;
}

/** A POS discount applied to an order, or the type/value the caller wants to apply. */
export type DiscountType = 'amount' | 'percent';

/** Discount input on a POS order create/edit request. */
export interface DiscountInput {
  type: DiscountType;
  value: number;
  source?: Record<string, unknown> | null;
}

/** Discount as recorded on an order (server-resolved amount + who gave it). */
export interface OrderDiscount {
  type: DiscountType;
  value: number;
  amount: number;
  given_by: string | null;
  source: Record<string, unknown> | null;
}

/** Full order record returned by the API. */
export interface Order {
  id: string;
  order_id: string;
  status: OrderStatus;
  customer_id: string | null;
  items?: OrderItemDetail[];
  total_amount: number;
  /** Sum of non-gift line prices before the discount (TASK-333). Legacy orders fall back to `total_amount`. */
  subtotal_amount?: number;
  /** null on legacy orders and orders with no discount applied. */
  discount?: OrderDiscount | null;
  /** User id who created the order (POS: the cashier). */
  created_by?: string | null;
  created_at: string;
  updated_at?: string;
  /** ISO time after which no new payment attempt is accepted; set only while AWAITING_PAYMENT. */
  payment_deadline?: string | null;
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
  variant_id?: string;
  variant_label?: string;
  /** POS-only FEFO selection: which batch/lot this line sells from. */
  batch_id?: string;
  batch_expiry_date?: string | null;
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
