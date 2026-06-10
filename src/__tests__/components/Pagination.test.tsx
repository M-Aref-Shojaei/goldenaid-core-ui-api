import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from '../../components/Pagination';

describe('Pagination', () => {
  it('renders nothing when totalPages <= 1', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} onChange={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders page buttons for each page', () => {
    render(<Pagination page={1} totalPages={3} onChange={vi.fn()} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls onChange with next page when › clicked', async () => {
    const onChange = vi.fn();
    render(<Pagination page={1} totalPages={3} onChange={onChange} />);
    await userEvent.click(screen.getByText('›'));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('calls onChange with prev page when ‹ clicked', async () => {
    const onChange = vi.fn();
    render(<Pagination page={2} totalPages={3} onChange={onChange} />);
    await userEvent.click(screen.getByText('‹'));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('calls onChange with page number when a page button is clicked', async () => {
    const onChange = vi.fn();
    render(<Pagination page={1} totalPages={3} onChange={onChange} />);
    await userEvent.click(screen.getByText('2'));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('disables ‹ on the first page', () => {
    render(<Pagination page={1} totalPages={3} onChange={vi.fn()} />);
    expect(screen.getByText('‹')).toBeDisabled();
  });

  it('disables › on the last page', () => {
    render(<Pagination page={3} totalPages={3} onChange={vi.fn()} />);
    expect(screen.getByText('›')).toBeDisabled();
  });
});
