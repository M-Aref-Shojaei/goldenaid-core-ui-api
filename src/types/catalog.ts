/** Single product image with sort order. */
export interface ProductImage {
  id?: string;
  url: string;
  alt: string | null;
  sort_order: number;
}

/** Product summary as returned in list endpoints. */
export interface ProductSummary {
  product_id: string;
  title: string;
  subtitle: string | null;
  sku: string | null;
  base_price: number;
  currency: string;
  short_description: string | null;
  description: string | null;
  is_active: boolean;
  brand_id: string | null;
  category_id: string | null;
  thumbnail_url: string | null;
}

/** Full product record including image gallery. */
export interface ProductDetail extends ProductSummary {
  images: ProductImage[];
}

/** Paginated product list response. */
export interface ProductListResponse {
  items: ProductSummary[];
  total: number;
}

/** Input shape for admin product creation. */
export interface AdminCreateProductInput {
  title: string;
  subtitle?: string;
  sku?: string;
  base_price: number;
  currency?: string;
  short_description?: string;
  description?: string;
  is_active?: boolean;
  image_url?: string;
}

/** Admin paginated product list response. */
export interface AdminProductListResponse {
  total: number;
  skip: number;
  limit: number;
  products: ProductSummary[];
}

/** Product brand. */
export interface Brand {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  is_active: boolean;
}

/**
 * Product category, as returned by `GET /v1/categories`.
 *
 * Only `id`/`name` are populated by the Catalog service today; the
 * remaining fields are reserved for a future nested-category model and
 * are optional so existing callers don't break when they show up.
 */
export interface Category {
  id: string;
  name: string;
  parent_id?: string | null;
  description?: string | null;
  icon_url?: string | null;
  is_active?: boolean;
}

/** Response shape for `GET /v1/categories` (via the BFF's `/api/v1/categories`). */
export interface CategoryListResponse {
  items: Category[];
}

/** Article as returned by the articles API. */
export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author_name: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

/** Input for creating an article (legacy — use `CreateArticleRequest` from the articles API module). */
export interface CreateArticleInput {
  title: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'published';
}

/** Partial input for updating an article (legacy — use `UpdateArticleRequest` from the articles API module). */
export interface UpdateArticleInput {
  title?: string;
  excerpt?: string;
  content?: string;
  status?: 'draft' | 'published';
}
