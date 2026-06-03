import { apiFetch } from '@/lib/api';
import { endpoints } from './endpoints';
import type {
  ListingCard,
  ListingPublic,
  ListingWithAddress,
  PaginatedResponse,
  SearchParams,
  CityStats,
  ListingStatus,
  ListingType,
  FurnishingStatus,
  PropertyFacing,
} from '@/types';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateListingPayload {
  listingType: ListingType;
  propertySubType: string;
  title: string;
  description: string;
  locality: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  fullAddress: string;
  latitude?: number;
  longitude?: number;
  bhk?: number;
  areaSqFt: number;
  floor?: number;
  totalFloors?: number;
  facing?: PropertyFacing;
  propertyAge?: number;
  furnishingStatus?: FurnishingStatus;
  rentOrPrice: number;
  securityDeposit?: number;
  maintenanceCharge?: number;
  availableFrom: string;       // ISO date string
  isNegotiable?: boolean;
  videoUrl?: string;
  amenities?: string[];
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const propertiesService = {
  /** Public paginated search */
  async search(params: SearchParams): Promise<PaginatedResponse<ListingCard>> {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
    });
    const query = qs.toString() ? `?${qs}` : '';
    return apiFetch(`${endpoints.properties.search}${query}`, { skipAuth: true });
  },

  /** City stats aggregation */
  async getCities(): Promise<CityStats[]> {
    return apiFetch(endpoints.properties.cities, { skipAuth: true });
  },

  /** Public detail (address hidden) */
  async getPublic(id: string): Promise<ListingPublic> {
    return apiFetch(endpoints.properties.getPublic(id), { skipAuth: true });
  },

  /** Full detail with decrypted address (requires successful unlock) */
  async getWithAddress(id: string): Promise<ListingWithAddress> {
    return apiFetch(endpoints.properties.getFull(id));
  },

  /** Create a new listing (OWNER / BROKER) */
  async create(payload: CreateListingPayload): Promise<ListingPublic> {
    return apiFetch(endpoints.properties.create, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /** Owner / broker — fetch their own listings */
  async getMyListings(): Promise<ListingPublic[]> {
    return apiFetch(endpoints.properties.myListings);
  },

  /** Update a listing */
  async update(id: string, payload: Partial<CreateListingPayload>): Promise<ListingPublic> {
    return apiFetch(endpoints.properties.update(id), {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  /** Delete a listing */
  async delete(id: string): Promise<void> {
    return apiFetch(endpoints.properties.delete(id), { method: 'DELETE' });
  },

  /** Change listing status */
  async setStatus(id: string, status: ListingStatus): Promise<{ id: string; status: ListingStatus }> {
    return apiFetch(endpoints.properties.setStatus(id), {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  /** Upload photos to a listing */
  async uploadPhotos(id: string, files: File[]): Promise<{ s3Url: string }[]> {
    const form = new FormData();
    files.forEach((f) => form.append('photos', f));
    return apiFetch(endpoints.properties.uploadPhotos(id), {
      method: 'POST',
      body: form,
    });
  },

  // ─── Admin ─────────────────────────────────────────────────────────────────

  async adminListAll(
    status?: ListingStatus,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<ListingPublic>> {
    const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) qs.set('status', status);
    return apiFetch(`${endpoints.properties.adminAll}?${qs}`);
  },

  async moderate(
    id: string,
    status: 'ACTIVE' | 'REJECTED',
    note?: string,
  ): Promise<ListingPublic> {
    return apiFetch(endpoints.properties.moderate(id), {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
  },
};
