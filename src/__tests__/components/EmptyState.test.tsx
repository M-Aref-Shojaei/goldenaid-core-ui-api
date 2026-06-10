import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '../../components/EmptyState';

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<EmptyState title="Empty" description="Try adding some items" />);
    expect(screen.getByText('Try adding some items')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(<EmptyState title="Empty" icon="📦" />);
    expect(screen.getByText('📦')).toBeInTheDocument();
  });

  it('renders action button and calls onClick', async () => {
    const onClick = vi.fn();
    render(<EmptyState title="Empty" action={{ label: 'Add item', onClick }} />);
    await userEvent.click(screen.getByText('Add item'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders action as anchor when href provided', () => {
    render(<EmptyState title="Empty" action={{ label: 'Go there', href: '/somewhere' }} />);
    const link = screen.getByText('Go there').closest('a');
    expect(link).toHaveAttribute('href', '/somewhere');
  });

  it('renders no action when action prop omitted', () => {
    render(<EmptyState title="Empty" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
