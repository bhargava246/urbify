import { apiFetch } from '@/lib/api';
import { endpoints } from './endpoints';
import type { SavedSearch, ShortlistItem, SearchParams } from '@/types';

export const searchService = {
  // ─── Saved searches ─────────────────────────────────────────────────────────

  async saveSearch(name: string, filters: SearchParams): Promise<SavedSearch> {
    return apiFetch(endpoints.search.savedSave, {
      method: 'POST',
      body: JSON.stringify({ name, filters }),
    });
  },

  async getSavedSearches(): Promise<SavedSearch[]> {
    return apiFetch(endpoints.search.savedList);
  },

  async deleteSavedSearch(id: string): Promise<void> {
    return apiFetch(endpoints.search.savedDelete(id), { method: 'DELETE' });
  },

  // ─── Shortlist ───────────────────────────────────────────────────────────────

  async addToShortlist(listingId: string): Promise<ShortlistItem> {
    return apiFetch(endpoints.search.shortlistAdd(listingId), { method: 'POST' });
  },

  async removeFromShortlist(listingId: string): Promise<void> {
    return apiFetch(endpoints.search.shortlistDel(listingId), { method: 'DELETE' });
  },

  async getShortlist(): Promise<ShortlistItem[]> {
    return apiFetch(endpoints.search.shortlistGet);
  },
};
