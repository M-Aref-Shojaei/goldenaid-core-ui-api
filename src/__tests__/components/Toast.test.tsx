import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from '../../components/Toast';

function ToastTrigger({ message = 'Hello', variant = undefined as any }) {
  const { toast } = useToast();
  return <button onClick={() => toast(message, variant)}>fire</button>;
}

function Wrapper({ message = 'Hello', variant = undefined as any }) {
  return (
    <ToastProvider>
      <ToastTrigger message={message} variant={variant} />
    </ToastProvider>
  );
}

describe('useToast', () => {
  it('throws when used outside ToastProvider', () => {
    const err = console.error;
    console.error = vi.fn();
    expect(() => render(<ToastTrigger />)).toThrow('useToast must be used inside ToastProvider');
    console.error = err;
  });
});

describe('ToastProvider', () => {
  it('anchors notifications below the header and exposes them as live status updates', async () => {
    render(<Wrapper message="Test toast" />);
    await userEvent.click(screen.getByText('fire'));

    const region = screen.getByRole('region', { name: 'اعلان‌ها' });
    expect(region).toHaveClass('top-20');
    expect(region).not.toHaveAttribute('aria-live');
    expect(screen.getByRole('status')).toHaveTextContent('Test toast');
  });

  it('shows toast message after toast() is called', async () => {
    render(<Wrapper message="Test toast" />);
    await userEvent.click(screen.getByText('fire'));
    expect(screen.getByText('Test toast')).toBeInTheDocument();
  });

  it('shows success icon for success variant', async () => {
    render(<Wrapper message="Done" variant="success" />);
    await userEvent.click(screen.getByText('fire'));
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('shows error icon for error variant', async () => {
    render(<Wrapper message="Oops" variant="error" />);
    await userEvent.click(screen.getByText('fire'));
    expect(screen.getByText('✕')).toBeInTheDocument();
  });

  it('dismisses toast when × button is clicked', async () => {
    render(<Wrapper message="Dismiss me" />);
    await userEvent.click(screen.getByText('fire'));
    expect(screen.getByText('Dismiss me')).toBeInTheDocument();
    await userEvent.click(screen.getByText('×'));
    expect(screen.queryByText('Dismiss me')).not.toBeInTheDocument();
  });

  it('auto-removes toast after 4 seconds', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<Wrapper message="Auto gone" />);
    await act(async () => {
      screen.getByText('fire').click();
    });
    expect(screen.getByText('Auto gone')).toBeInTheDocument();
    await act(async () => vi.advanceTimersByTimeAsync(4000));
    expect(screen.queryByText('Auto gone')).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});
