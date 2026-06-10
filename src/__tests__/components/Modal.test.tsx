import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '../../components/Modal';

describe('Modal', () => {
  it('renders nothing when open=false', () => {
    const { container } = render(
      <Modal open={false} onClose={vi.fn()}>Content</Modal>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders children when open=true', () => {
    render(<Modal open onClose={vi.fn()}>Modal body</Modal>);
    expect(screen.getByText('Modal body')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Modal open onClose={vi.fn()} title="My Modal">Body</Modal>);
    expect(screen.getByText('My Modal')).toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', async () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose}>Body</Modal>);
    // The backdrop is the div with aria-hidden
    const backdrop = document.querySelector('[aria-hidden]') as HTMLElement;
    await userEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when × button is clicked', async () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="Close me">Body</Modal>);
    await userEvent.click(screen.getByText('×'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when Escape key is pressed', async () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose}>Body</Modal>);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not call onClose on Escape when closed', async () => {
    const onClose = vi.fn();
    render(<Modal open={false} onClose={onClose}>Body</Modal>);
    await userEvent.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('has role=dialog', () => {
    render(<Modal open onClose={vi.fn()}>Content</Modal>);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
