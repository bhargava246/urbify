import { apiFetch, tokenStore } from '@/lib/api';
import { endpoints } from './endpoints';
import type { AuthResponse, AuthUser } from '@/types';

export interface RegisterPayload {
  phone: string;
  role: 'OWNER' | 'BROKER' | 'CLIENT';
  fullName: string;
  reraId?: string;
  city?: string;
  state?: string;
}

export interface LoginPayload {
  phone: string;
  password?: string;
}

export interface OtpVerifyPayload {
  phone: string;
  otpCode: string;
  role?: 'OWNER' | 'BROKER' | 'CLIENT';
}

export const authService = {
  /** Register a new user — returns tokens + user */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await apiFetch<AuthResponse>(endpoints.auth.register, {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true,
    });
    tokenStore.set(res.accessToken, res.refreshToken);
    tokenStore.setUser(res.user);
    return res;
  },

  /** Login with phone + password */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await apiFetch<AuthResponse>(endpoints.auth.login, {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true,
    });
    tokenStore.set(res.accessToken, res.refreshToken);
    tokenStore.setUser(res.user);
    return res;
  },

  /** Send OTP to phone */
  async sendOtp(phone: string): Promise<{ message: string }> {
    return apiFetch(endpoints.auth.otpSend, {
      method: 'POST',
      body: JSON.stringify({ phone }),
      skipAuth: true,
    });
  },

  /** Verify OTP — creates account if new user, or logs in existing user */
  async verifyOtp(payload: OtpVerifyPayload): Promise<AuthResponse> {
    const res = await apiFetch<AuthResponse>(endpoints.auth.otpVerify, {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true,
    });
    tokenStore.set(res.accessToken, res.refreshToken);
    tokenStore.setUser(res.user);
    return res;
  },

  /** Logout — clears tokens server-side and locally */
  async logout(): Promise<void> {
    try {
      await apiFetch(endpoints.auth.logout, { method: 'POST' });
    } finally {
      tokenStore.clear();
    }
  },

  /** Get the cached user from localStorage */
  getCachedUser(): AuthUser | null {
    return tokenStore.getUser<AuthUser>();
  },

  /** Is there a valid access token in storage? */
  isAuthenticated(): boolean {
    return !!tokenStore.getAccess();
  },
};
