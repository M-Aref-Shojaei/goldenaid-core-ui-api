import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCampaignDetail } from '../../hooks/useCampaignDetail';
import * as adminApi from '../../api/admin';

const baseCampaign = {
  id: 'c1',
  name: 'Summer Sale',
  message_text: 'Hello!',
  total_count: 3,
  sent_count: 0,
  failed_count: 0,
  created_at: '2026-07-01T00:00:00Z',
  sent_at: null,
  recipients: [],
};

const baseAnalytics = {
  campaign_id: 'c1',
  campaign_status: 'SENT' as const,
  total_recipients: 3,
  sent_count: 2,
  failed_count: 1,
  pending_count: 0,
  delivery_rate: 0.6667,
  failure_reasons: [{ reason: 'HTTP 400: invalid mobile number', count: 1 }],
  tracking_note: 'SMS channel: only gateway send outcome is tracked... no opens/clicks.',
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('useCampaignDetail', () => {
  it('does not fetch analytics while the campaign is still DRAFT', async () => {
    vi.spyOn(adminApi, 'getCampaign').mockResolvedValue({ ...baseCampaign, status: 'DRAFT' });
    const analyticsSpy = vi.spyOn(adminApi, 'getCampaignAnalytics');

    const { result } = renderHook(() => useCampaignDetail('c1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.campaign?.status).toBe('DRAFT');
    expect(result.current.analytics).toBeNull();
    expect(analyticsSpy).not.toHaveBeenCalled();
  });

  it('fetches and exposes analytics once the campaign has been sent', async () => {
    vi.spyOn(adminApi, 'getCampaign').mockResolvedValue({ ...baseCampaign, status: 'SENT' });
    vi.spyOn(adminApi, 'getCampaignAnalytics').mockResolvedValue(baseAnalytics);

    const { result } = renderHook(() => useCampaignDetail('c1'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => expect(result.current.analytics).not.toBeNull());

    expect(result.current.analytics?.sent_count).toBe(2);
    expect(result.current.analytics?.failed_count).toBe(1);
    expect(result.current.analytics?.failure_reasons).toHaveLength(1);
    expect(result.current.analytics?.tracking_note).toContain('opens/clicks');
  });

  it('falls back to null analytics if the analytics request fails', async () => {
    vi.spyOn(adminApi, 'getCampaign').mockResolvedValue({ ...baseCampaign, status: 'FAILED' });
    vi.spyOn(adminApi, 'getCampaignAnalytics').mockRejectedValue(new Error('network error'));

    const { result } = renderHook(() => useCampaignDetail('c1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.analytics).toBeNull();
  });
});
