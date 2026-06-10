import { apiFetch } from './client';
import type { AuthUser, VerifyOtpResponse, UpdateProfileResponse } from '../types/auth';

export async function requestOtp(phone: string): Promise<{ expires_in_seconds: number }> {
  return apiFetch('/auth/request-otp', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export async function verifyOtp(phone: string, code: string): Promise<VerifyOtpResponse> {
  return apiFetch('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, code }),
  });
}

export async function getMe(): Promise<AuthUser> {
  return apiFetch('/auth/me');
}

export async function updateProfile(name: string): Promise<UpdateProfileResponse> {
  return apiFetch('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}
