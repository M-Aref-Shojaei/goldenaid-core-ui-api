"use client";

import Link from "next/link";
import type { ProductSummary } from "../types/catalog";
import { formatPrice } from "../utils/helpers";

interface ProductCardProps {
  product: ProductSummary;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.product_id}`}
      className="block bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
    >
      <div className="h-52 bg-gray-50 flex items-center justify-center overflow-hidden">
        {product.thumbnail_url ? (
          <img
            src={product.thumbnail_url}
            alt={product.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-gray-300 text-4xl">📦</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-dark text-sm mb-1 line-clamp-2 leading-relaxed">
          {product.title}
        </h3>
        {product.short_description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
            {product.short_description}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <p className="text-gold font-bold text-sm">
            {formatPrice(product.base_price)}
          </p>
          <span className="text-xs bg-gold/10 text-gold px-2 py-1 rounded-lg font-medium">
            خرید
          </span>
        </div>
      </div>
    </Link>
  );
}
