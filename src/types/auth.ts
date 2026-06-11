/** Authenticated user profile returned by `/auth/me`. */
export interface AuthUser {
  user_id: string;
  phone: string;
  name: string | null;
  is_admin: boolean;
  role?: string;
}

/** Response from the request-OTP endpoint. */
export interface RequestOtpResponse {
  expires_in_seconds: number;
}

/** Response from the verify-OTP endpoint — includes the JWT access token. */
export interface VerifyOtpResponse {
  access_token: string;
  token_type: string;
  role: string;
}

/** Input for updating the authenticated user's profile. */
export interface UpdateProfileInput {
  name: string;
}

/** Combined profile response after a successful update. */
export interface UpdateProfileResponse extends AuthUser {
  message: string;
}
