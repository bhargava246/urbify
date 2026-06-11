import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ListingStatus, Role, Prisma } from '@prisma/client';
import * as CryptoJS from 'crypto-js';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateListingDto, UpdateListingDto, SearchListingDto, SortBy } from './dto';
import { buildPaginatedResponse, paginate } from '../../common/dto/pagination.dto';

@Injectable()
export class PropertiesService {
  private readonly logger = new Logger(PropertiesService.name);
  private readonly encKey: string;
  private readonly listingExpiryDays: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.encKey = configService.get<string>('app.encryptionKey')!;
    this.listingExpiryDays = configService.get<number>('app.listingExpiryDays')!;
  }

  // --- Helpers ---

  async createListing(ownerId: string, dto: CreateListingDto, userRole: Role) {
    this.logger.log(`Creating listing for ownerId=${ownerId} type=${dto.listingType}`);
    if (dto.listingType.includes('RENTAL') || dto.listingType.includes('SALE')) {
      if (!dto.bhk && dto.listingType.startsWith('RESIDENTIAL')) {
        throw new BadRequestException('BHK is required for residential properties');
      }
    }

    const encryptedAddress = CryptoJS.AES.encrypt(dto.fullAddress, this.encKey).toString();
    const expiresAt = new Date(Date.now() + this.listingExpiryDays * 24 * 60 * 60 * 1000);

    const listing = await this.prisma.listing.create({
      data: {
        ownerId,
        listingType: dto.listingType,
        status: userRole === Role.ADMIN ? 'ACTIVE' : 'PENDING_REVIEW',
        locality: dto.locality,
        landmark: dto.landmark,
        city: dto.city,
        state: dto.state,
        pincode: dto.pincode,
        encryptedAddress,
        latitude: dto.latitude,
        longitude: dto.longitude,
        // GeoJSON Point for proximity queries
        ...(dto.latitude && dto.longitude && {
          geoLocation: { type: 'Point', coordinates: [dto.longitude, dto.latitude] },
        }),
        title: dto.title,
        description: dto.description,
        propertySubType: dto.propertySubType,
        bhk: dto.bhk,
        areaSqFt: dto.areaSqFt,
        floor: dto.floor,
        totalFloors: dto.totalFloors,
        facing: dto.facing,
        propertyAge: dto.propertyAge,
        furnishingStatus: dto.furnishingStatus,
        rentOrPrice: dto.rentOrPrice,
        securityDeposit: dto.securityDeposit,
        maintenanceCharge: dto.maintenanceCharge,
        availableFrom: new Date(dto.availableFrom),
        isNegotiable: dto.isNegotiable ?? false,
        videoUrl: dto.videoUrl,
        isBrokerListing: userRole === Role.BROKER,
        expiresAt,
        amenities: dto.amenities?.length
          ? { create: dto.amenities.map((name) => ({ name })) }
          : undefined,
      },
      include: { amenities: true },
    });

    this.logger.log(`Listing created: id=${listing.id} ownerId=${ownerId}`);
    return listing;
  }

  // --- Helpers ---

  async searchListings(dto: SearchListingDto) {
    const { skip, take } = paginate(dto.page, dto.limit);
    const hasGeo = dto.lat !== undefined && dto.lng !== undefined;
    const radiusMetres = (dto.radiusKm ?? 5) * 1000;

  // --- Helpers ---
    // Prisma does not expose $near natively; we use $runCommandRaw when GPS
    // coordinates are supplied, then fall back to standard findMany otherwise.
    if (hasGeo) {
      const geoFilter: Record<string, any> = {
        status: 'ACTIVE',
        geoLocation: {
          $near: {
            $geometry: { type: 'Point', coordinates: [dto.lng, dto.lat] },
            $maxDistance: radiusMetres,
          },
        },
        ...(dto.listingType      && { listingType:      dto.listingType }),
        ...(dto.bhk              && { bhk:              dto.bhk }),
        ...(dto.furnishingStatus && { furnishingStatus: dto.furnishingStatus }),
        ...(dto.minPrice !== undefined && { rentOrPrice: { $gte: dto.minPrice } }),
        ...(dto.maxPrice !== undefined && {
          rentOrPrice: {
            ...(dto.minPrice !== undefined ? { $gte: dto.minPrice } : {}),
            $lte: dto.maxPrice,
          },
        }),
        ...(dto.minArea !== undefined && { areaSqFt: { $gte: dto.minArea } }),
      };

      const [raw, countRaw] = await Promise.all([
        (this.prisma as any).$runCommandRaw({
          find:       'listings',
          filter:     geoFilter,
          skip,
          limit:      take,
          projection: {
            _id: 1, listingType: 1, title: 1, locality: 1, city: 1, state: 1,
            bhk: 1, areaSqFt: 1, floor: 1, furnishingStatus: 1,
            rentOrPrice: 1, securityDeposit: 1, availableFrom: 1,
            isNegotiable: 1, isBrokerListing: 1, isBoostActive: 1,
            viewCount: 1, createdAt: 1, latitude: 1, longitude: 1,
          },
        }),
        (this.prisma as any).$runCommandRaw({ count: 'listings', query: geoFilter }),
      ]);

      const geoListings = (raw.cursor?.firstBatch ?? []).map((doc: any) => ({
        ...doc,
        id:        doc._id?.$oid ?? doc._id,
        photos:    [],
        amenities: [],
      }));

      return buildPaginatedResponse(geoListings, (countRaw as any).n ?? 0, dto.page, dto.limit);
    }

  // --- Helpers ---
    const where: Prisma.ListingWhereInput = {
      status: 'ACTIVE',
      ...(dto.city          && { city:     { contains: dto.city,     mode: 'insensitive' } }),
      ...(dto.locality      && { locality: { contains: dto.locality, mode: 'insensitive' } }),
      ...(dto.pincode       && { pincode:  dto.pincode }),
      ...(dto.listingType   && { listingType:   dto.listingType }),
      ...(dto.bhk           && { bhk:           dto.bhk }),
      ...(dto.furnishingStatus && { furnishingStatus: dto.furnishingStatus }),
      ...(dto.minPrice !== undefined && { rentOrPrice: { gte: dto.minPrice } }),
      ...(dto.maxPrice !== undefined && {
        rentOrPrice: {
          ...(dto.minPrice !== undefined ? { gte: dto.minPrice } : {}),
          lte: dto.maxPrice,
        },
      }),
      ...(dto.minArea !== undefined && { areaSqFt: { gte: dto.minArea } }),
      ...(dto.q && {
        OR: [
          { title:       { contains: dto.q, mode: 'insensitive' } },
          { locality:    { contains: dto.q, mode: 'insensitive' } },
          { city:        { contains: dto.q, mode: 'insensitive' } },
          { description: { contains: dto.q, mode: 'insensitive' } },
        ],
      }),
    };

    const orderBy = this.buildOrderBy(dto.sortBy);

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        skip,
        take,
        orderBy,
        select: {
          id:             true,
          listingType:    true,
          title:          true,
          locality:       true,
          city:           true,
          state:          true,
          bhk:            true,
          areaSqFt:       true,
          floor:          true,
          furnishingStatus: true,
          rentOrPrice:    true,
          securityDeposit: true,
          availableFrom:  true,
          isNegotiable:   true,
          isBrokerListing: true,
          isBoostActive:  true,
          viewCount:      true,
          createdAt:      true,
          latitude:       true,
          longitude:      true,
          photos:    { where: { isPrimary: true }, take: 1, select: { s3Url: true } },
          amenities: { select: { name: true } },
          // NOTE: full address NOT returned in public search
        },
      }),
      this.prisma.listing.count({ where }),
    ]);

    // Increment view counts in background (fire & forget)
    if (listings.length > 0) {
      void this.prisma.listing
        .updateMany({
          where: { id: { in: listings.map((l) => l.id) } },
          data:  { viewCount: { increment: 1 } },
        })
        .catch(() => undefined);
    }

    return buildPaginatedResponse(listings, total, dto.page, dto.limit);
  }

  // --- Helpers ---

  async getListingPublic(listingId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        listingType: true,
        status: true,
        title: true,
        description: true,
        locality: true,
        landmark: true,
        city: true,
        state: true,
        pincode: true,
        // encryptedAddress is EXCLUDED from public view
        latitude: true,
        longitude: true,
        bhk: true,
        areaSqFt: true,
        floor: true,
        totalFloors: true,
        facing: true,
        propertyAge: true,
        furnishingStatus: true,
        propertySubType: true,
        rentOrPrice: true,
        securityDeposit: true,
        maintenanceCharge: true,
        availableFrom: true,
        isNegotiable: true,
        videoUrl: true,
        isBrokerListing: true,
        viewCount: true,
        unlockCount: true,
        createdAt: true,
        photos: {
          orderBy: { order: 'asc' },
          select: { s3Url: true, isPrimary: true },
        },
        amenities: { select: { name: true } },
        owner: {
          select: {
            id: true,
            trustBadge: true,
            isVerified: true,
            ownerProfile: { select: { fullName: true } },
            brokerProfile: { select: { fullName: true, reraId: true, isReraVerified: true } },
          },
        },
      },
    });

    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.status !== 'ACTIVE') {
      throw new NotFoundException('Listing is not available');
    }

    return listing;
  }

  // --- Helpers ---

  async getListingWithAddress(listingId: string, clientId: string) {
    const unlock = await this.prisma.contactUnlock.findUnique({
      where: { clientId_listingId: { clientId, listingId } },
    });

    if (!unlock || unlock.status !== 'SUCCESS') {
      throw new ForbiddenException('Please unlock this listing first');
    }

    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        owner: {
          select: {
            phone: true,
            email: true,
            ownerProfile: { select: { fullName: true } },
            brokerProfile: { select: { fullName: true, reraId: true } },
          },
        },
      },
    });

    if (!listing) throw new NotFoundException('Listing not found');

    const decryptedBytes = CryptoJS.AES.decrypt(listing.encryptedAddress, this.encKey);
    const fullAddress = decryptedBytes.toString(CryptoJS.enc.Utf8);

    return { ...listing, fullAddress };
  }

  // --- Helpers ---

  async updateListing(listingId: string, ownerId: string, dto: UpdateListingDto) {
    this.logger.log(`Updating listing id=${listingId} by ownerId=${ownerId}`);
    const listing = await this.findOwnedListing(listingId, ownerId);

    const data: Record<string, unknown> = {
      ...dto,
      ...(dto.fullAddress && {
        encryptedAddress: CryptoJS.AES.encrypt(dto.fullAddress, this.encKey).toString(),
      }),
      ...(dto.availableFrom && { availableFrom: new Date(dto.availableFrom) }),
    };

    // Remove fields that aren't direct columns
    delete (data as Record<string, unknown>)['fullAddress'];
    delete (data as Record<string, unknown>)['amenities'];

    const updated = await this.prisma.listing.update({
      where: { id: listingId },
      data: {
        ...data,
        ...(dto.amenities && {
          amenities: {
            deleteMany: {},
            create: dto.amenities.map((name) => ({ name })),
          },
        }),
      },
      include: { amenities: true, photos: true },
    });

    return updated;
  }

  // --- Helpers ---

  async deleteListing(listingId: string, requesterId: string, role?: Role): Promise<void> {
    this.logger.log(`Deleting listing id=${listingId} by requesterId=${requesterId}`);
    if (role !== Role.ADMIN) {
      await this.findOwnedListing(listingId, requesterId);
    } else {
      const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
      if (!listing) throw new NotFoundException(`Listing ${listingId} not found`);
    }
    await this.prisma.listing.delete({ where: { id: listingId } });
    this.logger.log(`Listing deleted: id=${listingId}`);
  }

  // --- Helpers ---

  async setListingStatus(
    listingId: string,
    ownerId: string,
    status: ListingStatus,
  ) {
    await this.findOwnedListing(listingId, ownerId);
    return this.prisma.listing.update({
      where: { id: listingId },
      data: { status },
      select: { id: true, status: true },
    });
  }

  // --- Helpers ---

  async getOwnerListings(ownerId: string) {
    return this.prisma.listing.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      include: { photos: { where: { isPrimary: true }, take: 1 } },
    });
  }

  // --- Helpers ---

  async addPhotos(
    listingId: string,
    ownerId: string,
    photos: Array<{ s3Key: string; s3Url: string; order?: number }>,
  ) {
    await this.findOwnedListing(listingId, ownerId);

    const existingCount = await this.prisma.listingPhoto.count({
      where: { listingId },
    });

    await this.prisma.listingPhoto.createMany({
      data: photos.map((p, i) => ({
        listingId,
        s3Key: p.s3Key,
        s3Url: p.s3Url,
        order: p.order ?? existingCount + i,
        isPrimary: existingCount === 0 && i === 0,
      })),
    });

    return this.prisma.listingPhoto.findMany({ where: { listingId } });
  }

  // --- Helpers ---

  async moderateListing(
    listingId: string,
    status: 'ACTIVE' | 'REJECTED',
    note?: string,
  ) {
    this.logger.log(`Moderating listing id=${listingId} → status=${status}`);
    return this.prisma.listing.update({
      where: { id: listingId },
      data: {
        status,
        moderationNote: note,
        ...(status === 'REJECTED' && { rejectionReason: note }),
      },
    });
  }

  // --- Helpers ---

  async adminListAll(status?: ListingStatus, page = 1, limit = 20) {
    const { skip, take } = paginate(page, limit);
    const where = status ? { status } : {};

    const [data, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          photos: { where: { isPrimary: true }, take: 1 },
          owner: {
            select: { phone: true, role: true },
          },
        },
      }),
      this.prisma.listing.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, page, limit);
  }

  // --- Helpers ---

  async getCityStats(): Promise<{ name: string; count: number; avgRent: number }[]> {
    // MongoDB aggregation via Prisma raw query
    const results = await this.prisma.listing.aggregateRaw({
      pipeline: [
        { $match: { status: 'ACTIVE' } },
        {
          $group: {
            _id: '$city',
            count: { $sum: 1 },
            avgRent: { $avg: '$rentOrPrice' },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 12 },
        {
          $project: {
            _id: 0,
            name: '$_id',
            count: 1,
            avgRent: { $round: ['$avgRent', 0] },
          },
        },
      ],
    });

    return results as unknown as { name: string; count: number; avgRent: number }[];
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  private decryptAddress(encryptedAddress: string): string {
    try {
      const CryptoJS = require('crypto-js');
      const bytes = CryptoJS.AES.decrypt(encryptedAddress, this.encKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
      return '';
    }
  }

  private buildListingWhere(filters: {
    city?: string;
    bhk?: number;
    minPrice?: number;
    maxPrice?: number;
    furnishingStatus?: string;
    listingType?: string;
    status?: string;
    q?: string;
  }) {
    const where: any = { status: filters.status ?? 'ACTIVE' };
    if (filters.city)             where.city            = { contains: filters.city, mode: 'insensitive' };
    if (filters.bhk)              where.bhk             = filters.bhk;
    if (filters.furnishingStatus) where.furnishingStatus = filters.furnishingStatus;
    if (filters.listingType)      where.listingType     = filters.listingType;
    if (filters.minPrice || filters.maxPrice) {
      where.rentOrPrice = {};
      if (filters.minPrice) where.rentOrPrice.gte = filters.minPrice;
      if (filters.maxPrice) where.rentOrPrice.lte = filters.maxPrice;
    }
    if (filters.q) {
      where.OR = [
        { title:       { contains: filters.q, mode: 'insensitive' } },
        { locality:    { contains: filters.q, mode: 'insensitive' } },
        { city:        { contains: filters.q, mode: 'insensitive' } },
        { description: { contains: filters.q, mode: 'insensitive' } },
      ];
    }
    return where;
  }
  // ── Private helpers ────────────────────────────────────────────────────────

  private buildOrderBy(sortBy?: string): Record<string, 'asc' | 'desc'> {
    const map: Record<string, Record<string, 'asc' | 'desc'>> = {
      NEWEST:     { createdAt:    'desc' },
      OLDEST:     { createdAt:    'asc'  },
      PRICE_ASC:  { rentOrPrice:  'asc'  },
      PRICE_DESC: { rentOrPrice:  'desc' },
      AREA_ASC:   { areaSqFt:     'asc'  },
      AREA_DESC:  { areaSqFt:     'desc' },
    };
    return map[sortBy ?? 'NEWEST'] ?? { createdAt: 'desc' };
  }

  private async findOwnedListing(listingId: string, ownerId: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException(`Listing ${listingId} not found`);
    if (listing.ownerId !== ownerId)
      throw new ForbiddenException('You do not own this listing');
    return listing;
  }

}
