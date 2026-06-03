import { apiFetch } from '@/lib/api';
import { endpoints } from './endpoints';
import type { AuthUser, PaginatedResponse, UnlockRecord } from '@/types';

export interface UpdateProfilePayload {
  fullName?: string;
  email?: string;
  city?: string;
  state?: string;
  employmentType?: string;
  incomeRange?: string;
}

export const usersService = {
  /** Get current user profile */
  async getMe(): Promise<AuthUser> {
    return apiFetch(endpoints.users.me);
  },

  /** Update current user profile */
  async updateMe(payload: UpdateProfilePayload): Promise<AuthUser> {
    return apiFetch(endpoints.users.meUpdate, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  /** Get my unlock history (CLIENT) */
  async getMyUnlocks(page = 1, limit = 10): Promise<PaginatedResponse<UnlockRecord>> {
    const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
    return apiFetch(`${endpoints.users.myUnlocks}?${qs}`);
  },

  // ─── Admin ─────────────────────────────────────────────────────────────────

  /** [ADMIN] List all users */
  async listAll(
    page = 1,
    limit = 20,
    role?: string,
  ): Promise<PaginatedResponse<AuthUser>> {
    const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (role) qs.set('role', role);
    return apiFetch(`${endpoints.users.list}?${qs}`);
  },

  /** [ADMIN] Ban or activate a user */
  async setStatus(
    id: string,
    isBanned: boolean,
    isActive: boolean,
  ): Promise<AuthUser> {
    return apiFetch(endpoints.users.setStatus(id), {
      method: 'PATCH',
      body: JSON.stringify({ isBanned, isActive }),
    });
  },
};
