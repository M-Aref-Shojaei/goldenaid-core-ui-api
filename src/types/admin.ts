export interface Customer {
  id: string;
  phone: string;
  name: string | null;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface CustomerListResponse {
  total: number;
  page: number;
  page_size: number;
  items: Customer[];
}

export type CampaignStatus = 'DRAFT' | 'SENDING' | 'SENT' | 'FAILED';
export type RecipientStatus = 'PENDING' | 'SENT' | 'FAILED';

export interface Recipient {
  id: string;
  phone: string;
  status: RecipientStatus;
  error_msg: string | null;
  sent_at: string | null;
}

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

export interface Campaign extends CampaignSummary {
  message_text: string;
  recipients: Recipient[];
}

export interface CampaignSendResult {
  sent: number;
  failed: number;
  status: string;
}

export interface CreateCampaignInput {
  name: string;
  message_text: string;
  recipient_filter: 'all' | string[];
}

export interface AdminStats {
  total_users: number;
  total_campaigns: number;
  total_sms_sent: number;
}

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

export type FilterStatus =
  | 'all'
  | 'AWAITING_PAYMENT'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderFilters {
  searchQuery: string;
  filterStatus: FilterStatus;
  minPrice: string;
  maxPrice: string;
  startDate: string;
  endDate: string;
}

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

export type UserRole = 'admin' | 'manager' | 'user';

export interface AdminUser {
  user_id: string;
  phone: string;
  name?: string;
  role: UserRole;
  created_at: string;
}

export interface ImportResultRow {
  row_number: number;
  status: 'success' | 'skipped' | 'error';
  product_id?: string;
  sku?: string;
  title?: string;
  message: string;
}

export interface ImportResult {
  total_rows: number;
  successful: number;
  skipped: number;
  failed: number;
  results: ImportResultRow[];
}

export type AdminProductDetailProduct = {
  id: string;
  title: string;
  subtitle?: string;
  sku?: string;
  base_price: number;
  currency: string;
  short_description?: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  brand_id?: string;
  category_id?: string;
  created_at: string;
  updated_at: string;
};
