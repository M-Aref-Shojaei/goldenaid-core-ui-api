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

  it('on a rate-limited resend, shows the Persian message and restarts the countdown from Retry-After', async () => {
    const { result } = renderHook(() => useLogin());
    act(() => result.current.setPhone('09123456789'));
    await act(async () => result.current.requestOtp());

    vi.mocked(requestOtp).mockRejectedValue(
      new ApiError(429, 'کد تأیید به‌تازگی ارسال شده است. برای ارسال مجدد ۳۵ ثانیه صبر کنید.', 'RATE_LIMITED', 35),
    );
    await act(async () => result.current.resendOtp());

    expect(result.current.countdown).toBe(35);
    expect(result.current.error).toBe(
      'کد تأیید به‌تازگی ارسال شده است. برای ارسال مجدد ۳۵ ثانیه صبر کنید.',
    );
  });

  it('shows the circuit-breaker 503 message instead of the generic server error', async () => {
    vi.mocked(requestOtp).mockRejectedValue(
      new ApiError(503, 'ارسال پیامک موقتاً امکان‌پذیر نیست.', 'SMS_TEMPORARILY_UNAVAILABLE', 120),
    );
    const { result } = renderHook(() => useLogin());
    act(() => result.current.setPhone('09123456789'));
    await act(async () => result.current.requestOtp());

    expect(result.current.error).toBe('ارسال پیامک موقتاً امکان‌پذیر نیست.');
    expect(result.current.step).toBe('phone');
  });

  it('offers an immediate resend once the code is invalidated after too many wrong guesses', async () => {
    const { result } = renderHook(() => useLogin());
    act(() => result.current.setPhone('09123456789'));
    await act(async () => result.current.requestOtp());
    act(() => result.current.setCode('00000'));

    vi.mocked(verifyOtp).mockRejectedValue(
      new ApiError(400, 'کد تأیید باطل شد. لطفاً کد جدید دریافت کنید.', 'OTP_ATTEMPTS_EXCEEDED'),
    );
    await act(async () => result.current.verifyOtp());

    expect(result.current.countdown).toBe(0);
    expect(result.current.code).toBe('');
    expect(result.current.error).toBe('کد تأیید باطل شد. لطفاً کد جدید دریافت کنید.');
  });
});
