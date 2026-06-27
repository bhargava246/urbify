import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';
import { UpdateProfileDto } from './dto';
import { PaginationDto, buildPaginatedResponse, paginate } from '../../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Get own profile ──────────────────────────────────────────────────────────

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        email: true,
        role: true,
        isVerified: true,
        trustBadge: true,
        createdAt: true,
        ownerProfile: true,
        brokerProfile: true,
        clientProfile: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // ─── Update profile ───────────────────────────────────────────────────────────

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    this.logger.log(`Updating profile for userId=${userId}`);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { ownerProfile: true, brokerProfile: true, clientProfile: true },
    });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.update({
      where: { id: userId },
      data: { email: dto.email },
    });

    if (user.role === Role.OWNER && user.ownerProfile) {
      await this.prisma.ownerProfile.update({
        where: { userId },
        data: {
          fullName: dto.fullName,
          city: dto.city,
          state: dto.state,
        },
      });
    } else if (user.role === Role.BROKER && user.brokerProfile) {
      await this.prisma.brokerProfile.update({
        where: { userId },
        data: {
          fullName: dto.fullName,
          city: dto.city,
          state: dto.state,
          reraId: dto.reraId,
        },
      });
    } else if (user.role === Role.CLIENT && user.clientProfile) {
      await this.prisma.clientProfile.update({
        where: { userId },
        data: {
          fullName: dto.fullName,
          city: dto.city,
          employmentType: dto.employmentType,
          incomeRange: dto.incomeRange,
        },
      });
    }

    return this.getProfile(userId);
  }

  // ─── Admin: list all users ────────────────────────────────────────────────────

  async listUsers(pagination: PaginationDto, role?: Role) {
    const { skip, take } = paginate(pagination.page, pagination.limit);
    const where = role ? { role } : {};

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          phone: true,
          email: true,
          role: true,
          isVerified: true,
          isActive: true,
          isBanned: true,
          createdAt: true,
          ownerProfile:  { select: { fullName: true } },
          brokerProfile: { select: { fullName: true, reraId: true } },
          clientProfile: { select: { fullName: true } },
          _count: {
            select: {
              listings: true,
              unlocks:  true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, pagination.page, pagination.limit);
  }

  // ─── Admin: ban / activate user ───────────────────────────────────────────────

  async setUserStatus(
    userId: string,
    isBanned: boolean,
    isActive: boolean,
    isVerified?: boolean,
  ) {
    this.logger.log(`Setting user status: userId=${userId} isBanned=${isBanned} isActive=${isActive}`);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isBanned,
        isActive,
        ...(isVerified !== undefined && { isVerified }),
      },
      select: { id: true, isBanned: true, isActive: true, isVerified: true },
    });
  }

  // ─── Admin: get transaction history ───────────────────────────────────────────

  async getUserUnlocks(userId: string, pagination: PaginationDto) {
    const { skip, take } = paginate(pagination.page, pagination.limit);

    const [data, total] = await Promise.all([
      this.prisma.contactUnlock.findMany({
        where: { clientId: userId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              locality: true,
              city: true,
              rentOrPrice: true,
            },
          },
        },
      }),
      this.prisma.contactUnlock.count({ where: { clientId: userId } }),
    ]);

    return buildPaginatedResponse(data, total, pagination.page, pagination.limit);
  }
}
