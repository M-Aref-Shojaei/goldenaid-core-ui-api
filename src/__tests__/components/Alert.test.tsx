import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert } from '../../components/Alert';

describe('Alert', () => {
  it('renders children', () => {
    render(<Alert>Something went wrong</Alert>);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('has role="alert"', () => {
    render(<Alert>Error</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Alert title="Oops">Details here</Alert>);
    expect(screen.getByText('Oops')).toBeInTheDocument();
  });

  it('omits title element when title not provided', () => {
    render(<Alert>Details here</Alert>);
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });

  it('renders close button when onClose provided', () => {
    render(<Alert onClose={() => {}}>Info</Alert>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', async () => {
    const onClose = vi.fn();
    render(<Alert onClose={onClose}>Info</Alert>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('renders no close button when onClose omitted', () => {
    render(<Alert>Info</Alert>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it.each(['error', 'success', 'warning', 'info'] as const)(
    'renders variant=%s without error',
    (variant) => {
      render(<Alert variant={variant}>Message</Alert>);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    },
  );
});
