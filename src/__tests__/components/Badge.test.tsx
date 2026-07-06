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
        default: 'bg-neutral-75',
        success: 'bg-semantic-green-extralight',
        warning: 'bg-semantic-yellow-extralight',
        danger:  'bg-semantic-red-extralight',
        info:    'bg-primary-50',
        purple:  'bg-purple-100',
      };
      render(<Badge variant={variant}>{variant}</Badge>);
      expect(screen.getByText(variant).className).toContain(classMap[variant]);
    },
  );

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
