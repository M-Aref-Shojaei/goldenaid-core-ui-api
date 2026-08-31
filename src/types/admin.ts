import type { ProductImage } from './catalog';

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

/** Single entry in the recent-activity feed. */
export interface RecentActivityItem {
  type: RecentActivityType;
  id: string;
  title: string;
  timestamp: string;
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
  created_at: string;
  updated_at: string;
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
  category_id?: string;
  created_at: string;
  updated_at: string;
};
