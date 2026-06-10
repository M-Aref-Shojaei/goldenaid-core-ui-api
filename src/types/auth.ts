export interface AuthUser {
  user_id: string;
  phone: string;
  name: string | null;
  is_admin: boolean;
  role?: string;
}

export interface RequestOtpResponse {
  expires_in_seconds: number;
}

export interface VerifyOtpResponse {
  access_token: string;
  token_type: string;
  role: string;
}

export interface UpdateProfileInput {
  name: string;
}

export interface UpdateProfileResponse extends AuthUser {
  message: string;
}
