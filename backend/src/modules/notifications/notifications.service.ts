import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  NotificationChannel,
  NotificationType, Prisma } from '@prisma/client';
import { buildPaginatedResponse, paginate } from '../../common/dto/pagination.dto';

interface SendNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
  channels: NotificationChannel[];
  email?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  // ─── Send multi-channel notification ─────────────────────────────────────────

  async send(params: SendNotificationParams): Promise<void> {
    const dbPromises = params.channels.map((channel) =>
      this.prisma.notification.create({
        data: {
          userId: params.userId,
          type: params.type,
          channel,
          title: params.title,
          body: params.body,
          metadata: (params.metadata ?? {}) as Prisma.InputJsonValue,
        },
      }),
    );
    await Promise.all(dbPromises);

    // Send real email via Gmail SMTP
    if (params.channels.includes(NotificationChannel.EMAIL) && params.email) {
      try {
        await this.emailService.sendMail(
          params.email,
          params.title,
          `<p style="font-family:Inter,sans-serif;color:#374151">${params.body}</p>`,
        );
      } catch (err) {
        this.logger.error(`Failed to send email to ${params.email}: ${(err as Error).message}`);
      }
    }
  }

  // ─── Get user notifications ───────────────────────────────────────────────────

  async getUserNotifications(userId: string, page: number, limit: number) {
    const { skip, take } = paginate(page, limit);

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return buildPaginatedResponse(data, total, page, limit);
  }

  // ─── Mark as read ─────────────────────────────────────────────────────────────

  async markAllRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async markRead(userId: string, notificationId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  // ─── Unread count ─────────────────────────────────────────────────────────────

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { userId, isRead: false } });
  }

  // ─── Pre-built notification templates ────────────────────────────────────────

  async notifyListingLive(ownerId: string, listingTitle: string, ownerEmail?: string) {
    await this.send({
      userId: ownerId,
      type: NotificationType.LISTING_LIVE,
      title: 'Your listing is live! 🎉',
      body: `"${listingTitle}" is now visible to buyers/tenants on PropEase.`,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      email: ownerEmail,
    });
  }

  async notifyUnlockToOwner(
    ownerId: string,
    listingTitle: string,
    ownerEmail?: string,
  ) {
    await this.send({
      userId: ownerId,
      type: NotificationType.LISTING_UNLOCKED,
      title: 'Your listing contact was unlocked',
      body: `A buyer/tenant just unlocked contact for "${listingTitle}". Expect a call soon!`,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      email: ownerEmail,
    });
  }

  async notifyUnlockToClient(
    clientId: string,
    listingTitle: string,
    invoiceNumber: string,
    clientEmail?: string,
  ) {
    await this.send({
      userId: clientId,
      type: NotificationType.LISTING_UNLOCKED,
      title: 'Contact unlocked successfully',
      body: `You unlocked contact for "${listingTitle}". Invoice: ${invoiceNumber}`,
      metadata: { invoiceNumber },
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      email: clientEmail,
    });
  }

  async notifyListingExpiring(ownerId: string, listingTitle: string, ownerEmail?: string) {
    await this.send({
      userId: ownerId,
      type: NotificationType.LISTING_EXPIRING,
      title: 'Your listing expires in 3 days',
      body: `Renew "${listingTitle}" to keep it visible on PropEase.`,
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      email: ownerEmail,
    });
  }
}
