import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '../../components/ProductCard';
import { CartProvider, useCart } from '../../providers/CartProvider';
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
  variants: [],
};

const variantProduct: ProductSummary = {
  ...product,
  product_id: 'p2',
  variants: [
    { id: 'v1', label: 'کوچک', sort_order: 0, attributes: { size: 'S' }, sku: null },
    { id: 'v2', label: 'بزرگ', sort_order: 1, attributes: { size: 'L' }, sku: null },
  ],
};

function renderWithCart(ui: React.ReactElement) {
  return render(<CartProvider>{ui}</CartProvider>);
}

describe('ProductCard', () => {
  it('renders the product title', () => {
    renderWithCart(<ProductCard product={product} />);
    expect(screen.getByText('کرم مرطوب‌کننده')).toBeInTheDocument();
  });

  it('does not render a countdown badge by default', () => {
    renderWithCart(<ProductCard product={product} />);
    expect(screen.queryByText(/۵۲/)).not.toBeInTheDocument();
  });

  it('renders the countdown badge when countdownLabel is provided', () => {
    renderWithCart(<ProductCard product={product} countdownLabel="۵۲:۲۳:۰۰" />);
    expect(screen.getByText('۵۲:۲۳:۰۰')).toBeInTheDocument();
  });

  it('adds the product to the cart when clicked (no variant choice needed)', () => {
    function Probe() {
      const { items } = useCart();
      return <span data-testid="count">{items.length}</span>;
    }
    renderWithCart(
      <>
        <ProductCard product={product} />
        <Probe />
      </>,
    );
    fireEvent.click(screen.getByRole('button', { name: /افزودن به سبد/ }));
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByText('افزوده شد')).toBeInTheDocument();
  });

  it('navigates to the product page instead of adding directly when the product has multiple variants', () => {
    renderWithCart(<ProductCard product={variantProduct} />);
    expect(screen.queryByRole('button', { name: /افزودن به سبد/ })).not.toBeInTheDocument();
    const links = screen.getAllByRole('link', { name: /افزودن به سبد/ });
    expect(links[0]).toHaveAttribute('href', '/products/p2');
  });
});
