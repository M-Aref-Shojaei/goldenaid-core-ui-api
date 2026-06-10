export interface ProductImage {
  id?: string;
  url: string;
  alt: string | null;
  sort_order: number;
}

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

export interface ProductDetail extends ProductSummary {
  images: ProductImage[];
}

export interface ProductListResponse {
  items: ProductSummary[];
  total: number;
}

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

export interface AdminProductListResponse {
  total: number;
  skip: number;
  limit: number;
  products: ProductSummary[];
}

export interface Brand {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  is_active: boolean;
}

export interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  description: string | null;
  icon_url: string | null;
  is_active: boolean;
}

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

export interface CreateArticleInput {
  title: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'published';
}

export interface UpdateArticleInput {
  title?: string;
  excerpt?: string;
  content?: string;
  status?: 'draft' | 'published';
}
