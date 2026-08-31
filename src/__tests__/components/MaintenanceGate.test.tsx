import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MaintenanceGate } from '../../components/MaintenanceGate';
import * as useBackendHealthModule from '../../hooks/useBackendHealth';

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('MaintenanceGate', () => {
  it('renders children when the backend is up', () => {
    vi.spyOn(useBackendHealthModule, 'useBackendHealth').mockReturnValue({ isDown: false });

    render(
      <MaintenanceGate healthUrl="/health">
        <p>app content</p>
      </MaintenanceGate>,
    );

    expect(screen.getByText('app content')).toBeInTheDocument();
  });

  it('renders a maintenance message instead of children when the backend is down', () => {
    vi.spyOn(useBackendHealthModule, 'useBackendHealth').mockReturnValue({ isDown: true });

    render(
      <MaintenanceGate healthUrl="/health">
        <p>app content</p>
      </MaintenanceGate>,
    );

    expect(screen.queryByText('app content')).not.toBeInTheDocument();
    expect(screen.getByText(/در حال بروزرسانی/)).toBeInTheDocument();
  });
});
