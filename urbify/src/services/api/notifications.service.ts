import { apiFetch } from '@/lib/api';
import { endpoints } from './endpoints';
import type { Notification, PaginatedResponse } from '@/types';

export const notificationsService = {
  async list(page = 1, limit = 20): Promise<PaginatedResponse<Notification>> {
    const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
    return apiFetch(`${endpoints.notifications.list}?${qs}`);
  },

  async getUnreadCount(): Promise<{ count: number }> {
    return apiFetch(endpoints.notifications.unreadCount);
  },

  async markAllRead(): Promise<void> {
    return apiFetch(endpoints.notifications.readAll, { method: 'PATCH' });
  },

  async markRead(id: string): Promise<void> {
    return apiFetch(endpoints.notifications.readOne(id), { method: 'PATCH' });
  },
};
