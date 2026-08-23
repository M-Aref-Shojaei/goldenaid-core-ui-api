"use client";


import Link from "next/link";
import type { ProductSummary } from "../types/catalog";
import { formatPrice } from "../utils/helpers";

/** Props for the {@link ProductCard} component. */
interface ProductCardProps {
  product: ProductSummary;
  /**
   * Optional "زمان باقی مانده" countdown badge shown over the top-left
   * corner of the image (matches the Figma flash-deal card reference).
   * Purely presentational — pass a pre-formatted string (e.g. `"۵۲:۲۳:۰۰"`);
   * there's no backing "active flash sale" API yet, so callers decide when
   * to show it. Omitted by default so existing callers are unaffected.
   */
  countdownLabel?: string;
}

/**
 * Store product card matching Figma: white card, product image, title, Toman price, gold cart button.
 *
 * @param props - {@link ProductCardProps}
 */
export function ProductCard({ product, countdownLabel }: ProductCardProps) {
  return (
    <div className="bg-neutral-0 dark:bg-dark-card border border-neutral-75 dark:border-neutral-700 rounded-product overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group flex flex-col">
      {/* Image area */}
      <Link href={`/products/${product.product_id}`} className="block">
        <div className="aspect-square bg-cream-dark dark:bg-dark-secondary flex items-center justify-center overflow-hidden relative p-4">
          {countdownLabel && (
            <span className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-dark/80 text-white text-[10px] font-bold px-2 py-1 rounded-lg tabular-nums" dir="ltr">
              <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {countdownLabel}
            </span>
          )}
          {product.thumbnail_url ? (
            <img
              src={product.thumbnail_url}
              alt={product.title}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <span className="text-neutral-200 dark:text-neutral-600 text-5xl">📦</span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <Link href={`/products/${product.product_id}`}>
          <h3 className="font-semibold text-dark dark:text-white text-xs leading-6 line-clamp-2 mb-2 hover:text-gold transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Weight/variant if available */}
        {product.short_description && (
          <p className="text-[10px] text-neutral-400 dark:text-neutral-300 mb-2 line-clamp-1">
            {product.short_description}
          </p>
        )}

        {/* Price */}
        <div className="mt-auto">
          <p className="text-dark dark:text-white font-black text-sm mb-2">
            {formatPrice(product.base_price)}
          </p>

          {/* Add to cart button */}
          <Link
            href={`/products/${product.product_id}`}
            className="flex items-center justify-center gap-1.5 w-full bg-gold hover:bg-gold-dark text-white text-xs font-bold py-2 rounded-xl transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            افزودن به سبد
          </Link>
        </div>
      </div>
    </div>
  );
}
