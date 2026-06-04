// ─── Enums ────────────────────────────────────────────────────────────────────

export type ListingId = `URB-${number}`;

export type Role = 'OWNER' | 'BROKER' | 'CLIENT' | 'ADMIN';

export type ListingType =
  | 'RESIDENTIAL_RENTAL' | 'RESIDENTIAL_SALE'
  | 'COMMERCIAL_RENTAL'  | 'COMMERCIAL_SALE'
  | 'PG' | 'PLOT';

export type ListingStatus =
  | 'PENDING_REVIEW' | 'ACTIVE' | 'REJECTED'
  | 'EXPIRED' | 'RENTED' | 'SOLD' | 'PAUSED';

export type FurnishingStatus = 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FULLY_FURNISHED';
export type PropertyFacing   = 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' | 'NORTH_EAST' | 'NORTH_WEST' | 'SOUTH_EAST' | 'SOUTH_WEST';
export type UnlockStatus     = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type SortBy           = 'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC' | 'AREA_ASC' | 'AREA_DESC';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  phone: string;
  email?: string;
  role: Role;
  isVerified: boolean;
  trustBadge: boolean;
  ownerProfile?:  { fullName: string };
  brokerProfile?: { fullName: string; reraId?: string; isReraVerified: boolean };
  clientProfile?: { fullName: string };
}

export interface AuthResponse {
  accessToken:  string;
  refreshToken: string;
  user: AuthUser;
}

// ─── Properties ───────────────────────────────────────────────────────────────

export interface ListingPhoto {
  s3Url: string;
  isPrimary: boolean;
}

export interface ListingAmenity {
  name: string;
}

export interface ListingPublic {
  id: string;
  listingType: ListingType;
  status: ListingStatus;
  title: string;
  description?: string;
  locality: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  bhk?: number;
  areaSqFt?: number;
  floor?: number;
  totalFloors?: number;
  facing?: PropertyFacing;
  propertyAge?: number;
  furnishingStatus?: FurnishingStatus;
  propertySubType?: string;
  rentOrPrice: number;
  securityDeposit?: number;
  maintenanceCharge?: number;
  availableFrom: string;
  isNegotiable: boolean;
  videoUrl?: string;
  isBrokerListing: boolean;
  viewCount: number;
  unlockCount: number;
  createdAt: string;
  photos: ListingPhoto[];
  amenities: ListingAmenity[];
  owner?: {
    id: string;
    trustBadge: boolean;
    isVerified: boolean;
    ownerProfile?:  { fullName: string };
    brokerProfile?: { fullName: string; reraId?: string; isReraVerified: boolean };
  };
}

export interface ListingCard {
  id: string;
  listingType: ListingType;
  title: string;
  locality: string;
  city: string;
  state: string;
  bhk?: number;
  areaSqFt?: number;
  floor?: number;
  furnishingStatus?: FurnishingStatus;
  rentOrPrice: number;
  securityDeposit?: number;
  availableFrom: string;
  isNegotiable: boolean;
  isBrokerListing: boolean;
  isBoostActive: boolean;
  viewCount: number;
  createdAt: string;
  photos: ListingPhoto[];
  amenities: ListingAmenity[];
}

export type ListingWithAddress = Omit<ListingPublic, 'owner'> & {
  fullAddress: string;
  owner: {
    phone: string;
    email?: string;
    ownerProfile?:  { fullName: string };
    brokerProfile?: { fullName: string; reraId?: string };
  };
}

export interface PaginatedResponse<T> {
  data:       T[];
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

export interface SearchParams {
  city?:             string;
  locality?:         string;
  pincode?:          string;
  listingType?:      ListingType;
  bhk?:              number;
  furnishingStatus?: FurnishingStatus;
  minPrice?:         number;
  maxPrice?:         number;
  minArea?:          number;
  q?:                string;
  sortBy?:           SortBy;
  page?:             number;
  limit?:            number;
}

export interface CityStats {
  name:    string;
  count:   number;
  avgRent: number;
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export interface CreateOrderResponse {
  orderId:          string;
  razorpayOrderId?:  string;
  razorpayKeyId?:   string;
  amount:           number;
  currency:         string;
  listingId:        string;
  unlockId?:        string;
  unlockFee:        number;
  gst:              number;
  redirectUrl?:     string;
  merchantTransactionId?: string;
}

export interface UnlockResult {
  id:           string;
  listingId:    string;
  clientId:     string;
  status:       UnlockStatus;
  amountPaid:   number;
  createdAt:    string;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface Notification {
  id:        string;
  userId:    string;
  type:      string;
  title:     string;
  body?:     string;
  isRead:    boolean;
  createdAt: string;
}

// ─── Search / Shortlist ───────────────────────────────────────────────────────

export interface SavedSearch {
  id:        string;
  userId:    string;
  label?:    string;
  params:    SearchParams;
  createdAt: string;
}

export interface ShortlistItem {
  id:        string;
  userId:    string;
  listingId: string;
  createdAt: string;
}

export interface UnlockRecord {
  id:          string;
  listingId:   string;
  listing?:    ListingPublic;
  clientId:    string;
  status:      UnlockStatus;
  amountPaid:  number;
  createdAt:   string;
}
