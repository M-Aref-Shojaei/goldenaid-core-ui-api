import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from '../../components/ProductCard';
import type { ProductSummary } from '../../types/catalog';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const product: ProductSummary = {
  product_id: 'p1',
  title: 'کرم مرطوب‌کننده',
  subtitle: null,
  sku: null,
  base_price: 250000,
  currency: 'IRR',
  short_description: null,
  description: null,
  is_active: true,
  brand_id: null,
  category_id: null,
  thumbnail_url: null,
};

describe('ProductCard', () => {
  it('renders the product title', () => {
    render(<ProductCard product={product} />);
    expect(screen.getByText('کرم مرطوب‌کننده')).toBeInTheDocument();
  });

  it('does not render a countdown badge by default', () => {
    render(<ProductCard product={product} />);
    expect(screen.queryByText(/۵۲/)).not.toBeInTheDocument();
  });

  it('renders the countdown badge when countdownLabel is provided', () => {
    render(<ProductCard product={product} countdownLabel="۵۲:۲۳:۰۰" />);
    expect(screen.getByText('۵۲:۲۳:۰۰')).toBeInTheDocument();
  });
});
