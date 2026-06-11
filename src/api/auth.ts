import { apiFetch } from './client';
import type { AuthUser, VerifyOtpResponse, UpdateProfileResponse } from '../types/auth';

/** Requests an OTP to be sent to the given phone number. */
export async function requestOtp(phone: string): Promise<{ expires_in_seconds: number }> {
  return apiFetch('/auth/request-otp', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

/** Verifies an OTP code and returns a JWT access token on success. */
export async function verifyOtp(phone: string, code: string): Promise<VerifyOtpResponse> {
  return apiFetch('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, code }),
  });
}

/** Returns the currently authenticated user's profile. */
export async function getMe(): Promise<AuthUser> {
  return apiFetch('/auth/me');
}

/** Updates the authenticated user's display name. */
export async function updateProfile(name: string): Promise<UpdateProfileResponse> {
  return apiFetch('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}
