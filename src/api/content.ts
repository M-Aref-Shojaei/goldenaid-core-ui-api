import { apiFetch } from './client';
import type {
  HeroBanner,
  PromoBannerSlot,
  UpdateHeroBannerInput,
  UpdatePromoBannerSlotInput,
} from '../types/content';

/** Fetches the current home page hero banner (public, no auth required). */
export async function getHeroBanner(): Promise<HeroBanner> {
  return apiFetch('/content/hero-banner');
}

/** Fetches the active promo banner slots, in display order (public, no auth required). */
export async function getPromoBanners(): Promise<PromoBannerSlot[]> {
  return apiFetch('/content/promo-banners');
}

/** Fetches the hero banner for editing (admin only). */
export async function adminGetHeroBanner(): Promise<HeroBanner> {
  return apiFetch('/admin/content/hero-banner');
}

/** Updates the hero banner's headline/description/CTA/image (admin only). */
export async function adminUpdateHeroBanner(data: UpdateHeroBannerInput): Promise<HeroBanner> {
  return apiFetch('/admin/content/hero-banner', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/** Lists every promo banner slot, active and inactive (admin only). */
export async function adminListPromoBanners(): Promise<PromoBannerSlot[]> {
  return apiFetch('/admin/content/promo-banners');
}

/** Creates a new promo banner slot (admin only). */
export async function adminCreatePromoBanner(
  data: UpdatePromoBannerSlotInput,
): Promise<PromoBannerSlot> {
  return apiFetch('/admin/content/promo-banners', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Updates a promo banner slot's name/image/link/active toggle (admin only). */
export async function adminUpdatePromoBanner(
  id: string,
  data: UpdatePromoBannerSlotInput,
): Promise<PromoBannerSlot> {
  return apiFetch(`/admin/content/promo-banners/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/** Deletes a promo banner slot (admin only). */
export async function adminDeletePromoBanner(id: string): Promise<void> {
  await apiFetch(`/admin/content/promo-banners/${id}`, { method: 'DELETE' });
}
