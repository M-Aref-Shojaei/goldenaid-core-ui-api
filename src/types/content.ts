/** The storefront home page hero banner, as returned by the BFF. */
export interface HeroBanner {
  id: string;
  headline: string;
  description: string;
  cta_text?: string | null;
  cta_link?: string | null;
  target_product_id?: string | null;
  image_url?: string | null;
  updated_at: string;
}

/** Request body for an admin updating the hero banner. */
export interface UpdateHeroBannerInput {
  headline: string;
  description: string;
  cta_text?: string | null;
  cta_link?: string | null;
  target_product_id?: string | null;
  image_url?: string | null;
}

/** A single promotion banner slot on the storefront home page. */
export interface PromoBannerSlot {
  id: string;
  name: string;
  image_url?: string | null;
  link_url?: string | null;
  is_active: boolean;
  sort_order: number;
  updated_at: string;
}

/** Request body for an admin creating or updating a promo banner slot. */
export interface UpdatePromoBannerSlotInput {
  name: string;
  image_url?: string | null;
  link_url?: string | null;
  is_active: boolean;
}
