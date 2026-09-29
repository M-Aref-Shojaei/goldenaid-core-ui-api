import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../../components/Badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it.each(['default', 'success', 'warning', 'danger', 'info', 'purple', 'accent'] as const)(
    'applies correct class for variant=%s',
    (variant) => {
      const classMap = {
        default: 'bg-neutral-75',
        success: 'bg-semantic-green-extralight',
        warning: 'bg-semantic-yellow-extralight',
        danger:  'bg-semantic-red-extralight',
        info:    'bg-primary-50',
        purple:  'bg-purple-100',
        accent:  'bg-secondary-100',
      };
      render(<Badge variant={variant}>{variant}</Badge>);
      expect(screen.getByText(variant).className).toContain(classMap[variant]);
    },
  );

  it('accent pairs secondary-100 with secondary-800 text (AA 4.76:1, not the DS 700)', () => {
    render(<Badge variant="accent">هدیه</Badge>);
    const cls = screen.getByText('هدیه').className;
    expect(cls).toContain('bg-secondary-100');
    expect(cls).toContain('text-secondary-800');
    expect(cls).not.toContain('text-secondary-700');
  });

  it('defaults to variant=default when not specified', () => {
    render(<Badge>Label</Badge>);
    expect(screen.getByText('Label').className).toContain('bg-neutral-75');
  });

  it('applies sm size class', () => {
    render(<Badge size="sm">Small</Badge>);
    expect(screen.getByText('Small').className).toContain('px-2');
  });

  it('applies custom className', () => {
    render(<Badge className="extra-class">X</Badge>);
    expect(screen.getByText('X').className).toContain('extra-class');
  });
});
