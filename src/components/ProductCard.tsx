"use client";

import Link from "next/link";
import type { ProductSummary } from "../types/catalog";
import { formatPrice } from "../utils/helpers";

/** Props for the {@link ProductCard} component. */
interface ProductCardProps {
  product: ProductSummary;
}

/**
 * Store product card matching Figma: white card, product image, title, Rial price, gold cart button.
 *
 * @param props - {@link ProductCardProps}
 */
export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group flex flex-col">
      {/* Image area */}
      <Link href={`/products/${product.product_id}`} className="block">
        <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden relative p-4">
          {product.thumbnail_url ? (
            <img
              src={product.thumbnail_url}
              alt={product.title}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <span className="text-gray-200 text-5xl">📦</span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <Link href={`/products/${product.product_id}`}>
          <h3 className="font-semibold text-dark text-xs leading-6 line-clamp-2 mb-2 hover:text-gold transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Weight/variant if available */}
        {product.short_description && (
          <p className="text-[10px] text-gray-400 mb-2 line-clamp-1">
            {product.short_description}
          </p>
        )}

        {/* Price */}
        <div className="mt-auto">
          <p className="text-dark font-black text-sm mb-2">
            {formatPrice(product.base_price)}
            <span className="text-gray-400 font-normal text-[10px] mr-1">ریال</span>
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
