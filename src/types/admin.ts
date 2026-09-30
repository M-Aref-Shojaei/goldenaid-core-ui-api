import type { ProductImage } from './catalog';
import type { OrderDiscount, OrderItemDetail } from './orders';

/** Admin-visible customer record. */
export interface Customer {
  id: string;
  phone: string;
  name: string | null;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

/** Paginated customer list response. */
export interface CustomerListResponse {
  total: number;
  page: number;
  page_size: number;
  items: Customer[];
}

/** SMS campaign lifecycle states. */
export type CampaignStatus = 'DRAFT' | 'SENDING' | 'SENT' | 'FAILED';

/** Per-recipient SMS delivery state. */
export type RecipientStatus = 'PENDING' | 'SENT' | 'FAILED';

/** Single SMS campaign recipient. */
export interface Recipient {
  id: string;
  phone: string;
  status: RecipientStatus;
  error_msg: string | null;
  sent_at: string | null;
}

/** Campaign summary row (list endpoint). */
export interface CampaignSummary {
  id: string;
  name: string;
  status: CampaignStatus;
  total_count: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
  sent_at: string | null;
}

/** Full campaign record including recipients. */
export interface Campaign extends CampaignSummary {
  message_text: string;
  recipients: Recipient[];
}

/** Result returned after triggering campaign send. */
export interface CampaignSendResult {
  sent: number;
  failed: number;
  status: string;
}

/** One grouped failure reason and how many recipients hit it. */
export interface CampaignFailureReason {
  reason: string;
  count: number;
}

/**
 * Aggregate delivery analytics for one campaign.
 *
 * Reflects only what the SMS channel actually supports: whether the SMS.ir
 * gateway accepted or rejected each recipient's message at send time. There
 * is no delivery-receipt/webhook integration, so `sent_count` means "the
 * gateway API call succeeded," not "confirmed delivered to the handset."
 * SMS has no equivalent of email opens/clicks — `tracking_note` states this
 * explicitly so it isn't read as richer analytics than what is tracked.
 */
export interface CampaignAnalytics {
  campaign_id: string;
  campaign_status: CampaignStatus;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  pending_count: number;
  delivery_rate: number;
  failure_reasons: CampaignFailureReason[];
  tracking_note: string;
}

/** Input for creating a new SMS campaign. */
export interface CreateCampaignInput {
  name: string;
  message_text: string;
  recipient_filter: 'all' | string[];
}

/** High-level admin dashboard statistics. */
export interface AdminStats {
  total_users: number;
  total_campaigns: number;
  total_sms_sent: number;
}

/** Kind of event surfaced in the recent-activity feed. */
export type RecentActivityType = 'product_updated' | 'order_created';

/** Where an order originated. */
export type OrderChannel = 'online' | 'pos';

/** Single entry in the recent-activity feed. */
export interface RecentActivityItem {
  type: RecentActivityType;
  id: string;
  title: string;
  timestamp: string;
  /** Only present for type: 'order_created'. */
  channel?: OrderChannel;
  /** Titles of the first few items in the order (not the full order). Only present for type: 'order_created'. */
  items_preview?: string[];
}

/** Response shape for the recent-activity feed endpoint. */
export interface RecentActivityResponse {
  items: RecentActivityItem[];
}

/** Order summary as seen in the admin orders listing. */
export interface AdminOrder {
  id: string;
  customer_id: string;
  customer_phone?: string;
  customer_name?: string;
  status: string;
  total_amount: number;
  /** Sum of non-gift line prices before the discount (TASK-333); absent on legacy orders. */
  subtotal_amount?: number;
  /** null on legacy orders and orders with no discount applied. */
  discount?: OrderDiscount | null;
  /** User id who created the order (POS: the cashier). */
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  channel?: OrderChannel;
  items?: OrderItemDetail[];
}

/** One line item in an "edit POS sale" request -- full desired state, not a delta. */
export interface UpdateOrderItemInput {
  product_id: string;
  quantity: number;
  unit_price: number;
  variant_id?: string;
  variant_label?: string;
  /** POS-only: a free line given away, not charged (TASK-333). */
  is_gift?: boolean;
  source?: Record<string, unknown> | null;
}

/** Status filter option for the admin orders page. */
export type FilterStatus =
  | 'all'
  | 'AWAITING_PAYMENT'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

/** Combined filter state for the admin orders page. */
export interface OrderFilters {
  searchQuery: string;
  filterStatus: FilterStatus;
  minPrice: string;
  maxPrice: string;
  startDate: string;
  endDate: string;
}

/** Minimal product record for admin product listings. */
export interface AdminProductListItem {
  id: string;
  title: string;
  subtitle?: string;
  sku?: string;
  base_price: number;
  currency: string;
  image_url?: string;
  is_active: boolean;
}

/** User roles supported by the auth system. */
export type UserRole = 'admin' | 'manager' | 'writer' | 'user';

/** Admin-visible user record. */
export interface AdminUser {
  user_id: string;
  phone: string;
  name?: string;
  role: UserRole;
  created_at: string;
}

/** Paginated user list response. */
export interface UserListResponse {
  total: number;
  items: AdminUser[];
}

/** Single row in a product bulk-import result. */
export interface ImportResultRow {
  row_number: number;
  status: 'success' | 'skipped' | 'error';
  product_id?: string;
  sku?: string;
  title?: string;
  message: string;
}

/** Aggregate result of a product bulk import. */
export interface ImportResult {
  total_rows: number;
  successful: number;
  skipped: number;
  failed: number;
  results: ImportResultRow[];
}

/** Full product detail record used in the admin product-detail view.
 *
 * Backend has no `image_url` column — images live in a `ProductImage` list.
 * Existing images returned here have no `id` (only ones attached this
 * session, via `adminAttachProductImage`'s response, do).
 */
export type AdminProductDetailProduct = {
  id: string;
  title: string;
  subtitle?: string;
  sku?: string;
  base_price: number;
  currency: string;
  short_description?: string;
  description?: string;
  images?: ProductImage[];
  is_active: boolean;
  brand_id?: string;
  brand_name?: string | null;
  category_id?: string;
  created_at: string;
  updated_at: string;
};

/** One line item on a supplier invoice, enriched with the product's title
 *  (Inventory only knows the product id; the BFF attaches the title). */
export type SupplierInvoiceItem = {
  id: string;
  product_id: string;
  variant_id?: string | null;
  quantity: number;
  unit_cost: number;
  product_title: string;
  /** The stored effective sell price (the band default is resolved before the
   *  write); null = the line was never priced (zero-cost or legacy line). */
  sell_price?: number | null;
  /** true for a new line or one whose `unit_cost` changed in this PATCH -- these are the lines core-bff reprices. */
  cost_changed?: boolean;
};

/** Supplier invoice as returned by the list endpoint (no line items, but
 *  annotated with an item count and total amount computed server-side). */
export type SupplierInvoice = {
  id: string;
  supplier_name: string;
  invoice_number?: string | null;
  invoice_date: string;
  created_at: string;
  updated_at: string;
  /** Set when the invoice is soft-deleted (also by `updateSupplierInvoice` with `items: []`). */
  deleted_at?: string | null;
  payment_method?: 'cash' | 'transfer' | null;
  paid_at?: string | null;
  payment_reference?: string | null;
  item_count: number;
  total_amount: number;
};

/** Supplier invoice detail, including its line items. */
export type SupplierInvoiceDetail = SupplierInvoice & {
  items: SupplierInvoiceItem[];
  /** false means at least one line's catalog price write failed after stock was already
   *  committed (TASK-332); retry with `applySupplierInvoicePrices`. Absent on plain reads. */
  pricing_applied?: boolean;
  /** Per-line pricing outcome, present on create/edit/apply-prices responses only. */
  pricing?: PricingResultLine[];
  /** Only when `pricing_applied` is false: the upstream error body (`{error_code, message, details?}`). */
  pricing_error?: { error_code?: string; message?: string; details?: Record<string, unknown> } | null;
  /** Only when `pricing_applied` is false: the line ids to pass to `applySupplierInvoicePrices`. */
  pending_item_ids?: string[];
};

/** Payload for creating one supplier invoice line item. */
export type SupplierInvoiceItemCreate = {
  product_id: string;
  variant_id?: string;
  quantity: number;
  unit_cost: number;
  /** Pricing is opt-in by the key's presence (TASK-332): omitted = the line is
   *  not priced (legacy behavior; if no line carries the key, no pricing runs at
   *  all); `null` = the price band's default (ceil); a number = that price,
   *  validated against the band server-side (422 `PRICING_INVALID`). */
  sell_price?: number | null;
};

/** Payload for editing one supplier invoice line item -- full desired state,
 *  not a delta. Omitting `id` creates a new line. */
export type SupplierInvoiceItemUpdate = {
  id?: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  unit_cost: number;
  /** Pricing is opt-in by the key's presence (TASK-332): omitted = the line is
   *  not priced (legacy behavior; if no line carries the key, no pricing runs at
   *  all); `null` = the price band's default (ceil); a number = that price,
   *  validated against the band server-side (422 `PRICING_INVALID`).
   *  On edit only new, re-costed or re-priced lines are repriced. */
  sell_price?: number | null;
};

/** Payload for `updateSupplierInvoice` -- every field optional and only the
 *  given ones are changed. Sending `items` replaces the full line list and
 *  triggers a stock/price reconciliation; omitting it edits only the header/payment.
 *  `items: []` removes every line and soft-deletes the invoice in one step: the 200
 *  response has `deleted_at` set; 409 `SUPPLIER_INVOICE_STOCK_CONFLICT` (nothing
 *  changed) when a product's available stock can't absorb the removed quantity,
 *  409 `SUPPLIER_INVOICE_DELETED` if it was already deleted. */
export type SupplierInvoiceUpdate = Partial<{
  supplier_name: string;
  invoice_number: string | null;
  invoice_date: string;
  deleted: boolean;
  payment_method: 'cash' | 'transfer' | null;
  paid_at: string | null;
  payment_reference: string | null;
  clear_payment: boolean;
  items: SupplierInvoiceItemUpdate[];
}>;

/** Payload for creating a supplier invoice. */
export type SupplierInvoiceCreate = {
  supplier_name: string;
  invoice_number?: string;
  invoice_date: string;
  items: SupplierInvoiceItemCreate[];
};

/** Lifecycle of one purchase-list item («لیست سفارش خرید», TASK-309). */
export type PurchaseListStatus = 'todo' | 'ordered' | 'received';

/** One purchase-list item, enriched with its catalog title/variant label
 *  and its linked invoice's display fields (all joined by the backend). */
export type PurchaseListItem = {
  id: string;
  product_id: string | null;
  variant_id: string | null;
  free_text: string | null;
  variety_text: string | null;
  quantity: number;
  supplier_name: string | null;
  compare_price: boolean;
  winning_supplier_name: string | null;
  winning_unit_price: number | null;
  status: PurchaseListStatus;
  invoice_id: string | null;
  invoice_number: string | null;
  invoice_supplier_name: string | null;
  invoice_date: string | null;
  invoice_deleted: boolean;
  created_at: string;
  updated_at: string;
  ordered_at: string | null;
  received_at: string | null;
  created_by: string;
  updated_by: string;
  ordered_by: string | null;
  received_by: string | null;
  product_title: string | null;
  variant_label: string | null;
};

/** Payload for creating a purchase-list item: exactly one of `product_id` /
 *  `free_text`; `variant_id` (if given) requires `product_id`. A null/absent
 *  `supplier_name` means «مقایسه قیمت» (compare price). */
export type PurchaseListItemCreateInput = {
  product_id?: string;
  variant_id?: string;
  free_text?: string;
  variety_text?: string;
  quantity: number;
  supplier_name?: string;
};

/** Partial edit of a purchase-list item (never status). */
export type PurchaseListItemUpdateInput = Partial<{
  product_id: string | null;
  variant_id: string | null;
  free_text: string | null;
  variety_text: string | null;
  quantity: number;
  supplier_name: string | null;
  winning_supplier_name: string | null;
  winning_unit_price: number | null;
}>;

/** Moves one or more items. `to: "ordered"` on already-received items is
 *  the undo-received action. Winner fields apply only to a single
 *  compare-price item moving todo -> ordered; `invoice_id` only applies to
 *  ordered -> received. */
export type PurchaseListTransitionInput = {
  ids: string[];
  to: 'ordered' | 'received';
  winning_supplier_name?: string;
  winning_unit_price?: number;
  invoice_id?: string;
};

/** A supplier invoice offered in the receiving dialog's «فاکتور خرید» select. */
export type PurchaseListInvoiceOption = {
  id: string;
  invoice_number: string | null;
  supplier_name: string;
  invoice_date: string;
};

// ── Pricing (TASK-332) ──────────────────────────────────────────────────────

/** Global markup/rounding settings used to price supplier-invoice lines. */
export interface PricingSettings {
  /** 0..500. */
  markup_percent: number;
  /** Toman; the sell price is always rounded to a multiple of this. */
  round_step: number;
  updated_at: string;
  updated_by: string | null;
}

/** Reasons a proposed line's sell price is rejected by `POST /admin/pricing/apply`. */
export type PricingErrorCode =
  | 'OUT_OF_BAND'
  | 'COST_CONFLICT'
  | 'SELL_PRICE_CONFLICT'
  | 'PRODUCT_NOT_FOUND';

/** Per-line pricing error, keyed by the caller's `ref` (matches `client.ts`'s `ApiError.details.lines`). */
export interface PricingErrorLine {
  ref: string;
  code: PricingErrorCode;
  floor: number;
  ceil: number;
}

/** Per-line pricing outcome: the computed band and the price that would apply. */
export interface PricingResultLine {
  ref: string;
  product_id: string;
  computed: number;
  floor: number;
  ceil: number;
  /** null for a skipped `unit_cost === 0` (supplier freebie) line. */
  sell_price: number | null;
  applied: boolean;
}
