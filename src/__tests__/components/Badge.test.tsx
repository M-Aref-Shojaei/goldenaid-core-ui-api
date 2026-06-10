import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../../components/Badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it.each(['default', 'success', 'warning', 'danger', 'info', 'purple'] as const)(
    'applies correct class for variant=%s',
    (variant) => {
      const classMap = {
        default: 'bg-gray-100',
        success: 'bg-green-100',
        warning: 'bg-yellow-100',
        danger:  'bg-red-100',
        info:    'bg-blue-100',
        purple:  'bg-purple-100',
      };
      render(<Badge variant={variant}>{variant}</Badge>);
      expect(screen.getByText(variant).className).toContain(classMap[variant]);
    },
  );

  it('defaults to variant=default when not specified', () => {
    render(<Badge>Label</Badge>);
    expect(screen.getByText('Label').className).toContain('bg-gray-100');
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
