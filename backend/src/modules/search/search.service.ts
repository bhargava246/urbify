import { Prisma } from '@prisma/client';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SaveSearchDto } from './dto/save-search.dto';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Saved searches ───────────────────────────────────────────────────────────

  async saveSearch(userId: string, dto: SaveSearchDto) {
    this.logger.log(`Saving search for userId=${userId} name=${dto.name}`);
    return this.prisma.savedSearch.create({
      data: { userId, name: dto.name, filters: dto.filters as Prisma.InputJsonValue },
    });
  }

  async getSavedSearches(userId: string) {
    return this.prisma.savedSearch.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteSavedSearch(userId: string, searchId: string) {
    const search = await this.prisma.savedSearch.findUnique({ where: { id: searchId } });
    if (!search || search.userId !== userId) throw new NotFoundException('Saved search not found');
    await this.prisma.savedSearch.delete({ where: { id: searchId } });
  }

  // ─── Shortlists ────────────────────────────────────────────────────────────────

  async addToShortlist(userId: string, listingId: string) {
    this.logger.log(`Adding listingId=${listingId} to shortlist for userId=${userId}`);
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Listing not found');

    const existing = await this.prisma.shortlist.findUnique({
      where: { userId_listingId: { userId, listingId } },
    });
    if (existing) throw new ConflictException('Already in shortlist');

    return this.prisma.shortlist.create({ data: { userId, listingId } });
  }

  async removeFromShortlist(userId: string, listingId: string) {
    this.logger.log(`Removing listingId=${listingId} from shortlist for userId=${userId}`);
    await this.prisma.shortlist.deleteMany({ where: { userId, listingId } });
  }

  async getShortlist(userId: string) {
    return this.prisma.shortlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            locality: true,
            city: true,
            bhk: true,
            rentOrPrice: true,
            listingType: true,
            status: true,
            photos: {
              where: { isPrimary: true },
              take: 1,
              select: { s3Url: true },
            },
          },
        },
      },
    });
  }
}
