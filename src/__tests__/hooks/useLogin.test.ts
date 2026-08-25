import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useLogin } from '../../hooks/useLogin';
import { requestOtp, verifyOtp, getMe } from '../../api/auth';
import { ApiError } from '../../api/client';

const push = vi.fn();
const login = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('../../providers/AuthProvider', () => ({
  useAuth: () => ({ login }),
}));

vi.mock('../../api/auth', () => ({
  requestOtp: vi.fn(),
  verifyOtp: vi.fn(),
  getMe: vi.fn(),
}));

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requestOtp).mockResolvedValue({ expires_in_seconds: 120 });
    vi.mocked(verifyOtp).mockResolvedValue({
      access_token: 'token',
      token_type: 'bearer',
      role: 'user',
    });
    vi.mocked(getMe).mockResolvedValue({
      user_id: 'user-1',
      phone: '09123456789',
      role: 'user',
      is_admin: false,
      name: null,
    });
  });

  it('waits for explicit submission before requesting an OTP', async () => {
    const { result } = renderHook(() => useLogin());

    act(() => result.current.setPhone('09123456789'));

    await act(async () => Promise.resolve());
    expect(requestOtp).not.toHaveBeenCalled();

    await act(async () => result.current.requestOtp());
    expect(requestOtp).toHaveBeenCalledTimes(1);
    expect(requestOtp).toHaveBeenCalledWith('09123456789');
  });

  it('waits for explicit submission before verifying a complete OTP', async () => {
    const { result } = renderHook(() => useLogin());

    act(() => result.current.setPhone('09123456789'));
    await act(async () => result.current.requestOtp());
    act(() => result.current.setCode('75194'));

    await act(async () => Promise.resolve());
    expect(verifyOtp).not.toHaveBeenCalled();

    await act(async () => result.current.verifyOtp());
    await waitFor(() => expect(push).toHaveBeenCalledWith('/'));
    expect(verifyOtp).toHaveBeenCalledTimes(1);
  });

  it('shows the backend-provided Persian message for a validation error', async () => {
    vi.mocked(requestOtp).mockRejectedValue(
      new ApiError(422, 'شماره موبایل را به‌صورت صحیح وارد کنید (مثال: ۰۹۱۲۱۲۳۴۵۶۷)'),
    );
    const { result } = renderHook(() => useLogin());

    act(() => result.current.setPhone('12345'));
    await act(async () => result.current.requestOtp());

    expect(result.current.error).toBe(
      'شماره موبایل را به‌صورت صحیح وارد کنید (مثال: ۰۹۱۲۱۲۳۴۵۶۷)',
    );
  });

  it('translates a network failure to Persian instead of showing raw English', async () => {
    vi.mocked(requestOtp).mockRejectedValue(
      new ApiError(0, 'Network error', 'NETWORK_ERROR'),
    );
    const { result } = renderHook(() => useLogin());

    act(() => result.current.setPhone('09123456789'));
    await act(async () => result.current.requestOtp());

    expect(result.current.error).toBe('خطا در برقراری ارتباط با سرور');
  });
});
