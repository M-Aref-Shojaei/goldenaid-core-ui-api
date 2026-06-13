"use client";

import Link from "next/link";
import type { ProductSummary } from "../types/catalog";
import { formatPrice } from "../utils/helpers";

/** Props for the {@link ProductCard} component. */
interface ProductCardProps {
  product: ProductSummary;
}

/** Store product card with thumbnail, title, price, and buy CTA. */
export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.product_id}`}
      className="block bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group"
    >
      {/* Image */}
      <div className="aspect-square bg-cream-dark flex items-center justify-center overflow-hidden relative">
        {product.thumbnail_url ? (
          <img
            src={product.thumbnail_url}
            alt={product.title}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-gray-200 text-5xl">📦</span>
        )}
        {/* Badge */}
        <div className="absolute top-2 right-2">
          <span className="bg-gold text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            موجود
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-dark text-sm mb-2 line-clamp-2 leading-6">
          {product.title}
        </h3>
        {product.short_description && (
          <p className="text-xs text-gray-400 mb-3 line-clamp-1">
            {product.short_description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <p className="text-gold font-black text-base">
            {formatPrice(product.base_price)}
          </p>
          <span className="flex items-center gap-1 text-xs bg-gold text-white px-3 py-1.5 rounded-xl font-bold group-hover:bg-gold-dark transition-colors">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            خرید
          </span>
        </div>
      </div>
    </Link>
  );
}
