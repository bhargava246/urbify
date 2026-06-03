'use client';
/**
 * Urbify AuthContext
 * Provides: user, isAuthenticated, login/register/logout via OTP
 */
import React, {
  createContext, useCallback, useContext,
  useEffect, useMemo, useState,
} from 'react';
import { authService } from '@/services/api/auth.service';
import { tokenStore } from '@/lib/api';
import type { AuthUser, Role } from '@/types';

// ─── Context shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  /** Send OTP to phone — call before verifyOtp */
  sendOtp: (phone: string) => Promise<void>;

  /**
   * Verify OTP (first call creates account if needed).
   * Pass `role` only for new registrations.
   */
  verifyOtp: (phone: string, otp: string, role?: Role, fullName?: string) => Promise<AuthUser>;

  logout: () => Promise<void>;

  /** Refresh cached user from /users/me */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => tokenStore.getUser<AuthUser>());
  const [isLoading, setIsLoading] = useState(false);

  // On mount, silently re-fetch /users/me to validate token + get fresh data
  useEffect(() => {
    if (!tokenStore.getAccess()) return;
    authService
      .verifyOtp // no — use usersService
    ; // we'll call it below in refreshUser
    void refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshUser = useCallback(async () => {
    if (!tokenStore.getAccess()) return;
    try {
      const { usersService } = await import('@/services/api/users.service');
      const freshUser = await usersService.getMe();
      tokenStore.setUser(freshUser);
      setUser(freshUser);
    } catch {
      // token invalid — clear
      tokenStore.clear();
      setUser(null);
    }
  }, []);

  const sendOtp = useCallback(async (phone: string) => {
    setIsLoading(true);
    try {
      await authService.sendOtp(phone);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(
    async (phone: string, otp: string, role?: Role, fullName?: string): Promise<AuthUser> => {
      setIsLoading(true);
      try {
        const payload: Parameters<typeof authService.verifyOtp>[0] = {
          phone,
          otpCode: otp,
          ...(role && role !== 'ADMIN' ? { role: role as 'OWNER' | 'BROKER' | 'CLIENT' } : {}),
        };

        // If this is a registration flow (role + fullName provided), register first
        if (role && fullName) {
          try {
            const regRes = await authService.register({ phone, role: role as 'OWNER' | 'BROKER' | 'CLIENT', fullName });
            setUser(regRes.user);
            return regRes.user;
          } catch {
            // user may already exist — fall through to verifyOtp
          }
        }

        const res = await authService.verifyOtp(payload);
        setUser(res.user);
        return res.user;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      sendOtp,
      verifyOtp,
      logout,
      refreshUser,
    }),
    [user, isLoading, sendOtp, verifyOtp, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
