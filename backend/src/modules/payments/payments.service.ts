import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UnlockStatus } from '@prisma/client';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto, VerifyPaymentDto, RefundRequestDto } from './dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly platformFeeDays: number;
  private readonly gstRate: number;
  private readonly merchantId: string;
  private readonly saltKey: string;
  private readonly saltIndex: string;
  private readonly baseUrl: string;
  private readonly frontendUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.platformFeeDays = configService.get<number>('app.platformFeeDays')!;
    this.gstRate         = configService.get<number>('app.gstRate')!;
    this.merchantId      = configService.get<string>('phonepe.merchantId')!;
    this.saltKey         = configService.get<string>('phonepe.saltKey')!;
    this.saltIndex       = configService.get<string>('phonepe.saltIndex') ?? '1';
    this.baseUrl         = configService.get<string>('phonepe.baseUrl')!;
    this.frontendUrl     = configService.get<string>('app.frontendUrl') ?? 'http://localhost:3000';
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  /** SHA256( base64Payload + apiPath + saltKey ) + "###" + saltIndex */
  private buildXVerify(base64Payload: string, apiPath: string): string {
    const raw = `${base64Payload}${apiPath}${this.saltKey}`;
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    return `${hash}###${this.saltIndex}`;
  }

  /** SHA256( apiPath + saltKey ) + "###" + saltIndex  (for GET status) */
  private buildXVerifyGet(apiPath: string): string {
    const raw = `${apiPath}${this.saltKey}`;
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    return `${hash}###${this.saltIndex}`;
  }

  // ─── Create PhonePe payment ────────────────────────────────────────────────────

  async createOrder(clientId: string, dto: CreateOrderDto) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: dto.listingId },
      select: { id: true, rentOrPrice: true, status: true, ownerId: true },
    });

    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.status !== 'ACTIVE') throw new BadRequestException('Listing is not active');
    if (listing.ownerId === clientId) {
      throw new ForbiddenException('You cannot unlock your own listing');
    }

    // Duplicate unlock guard
    const existing = await this.prisma.contactUnlock.findUnique({
      where: { clientId_listingId: { clientId, listingId: dto.listingId } },
    });
    if (existing?.status === UnlockStatus.SUCCESS) {
      throw new ConflictException('You have already unlocked this listing');
    }

    // Fee calculation: platformFeeDays × daily rent + GST
    const dailyRent      = listing.rentOrPrice / 30;
    const platformFeeInr = parseFloat((dailyRent * this.platformFeeDays).toFixed(2));
    const gstAmount      = parseFloat((platformFeeInr * this.gstRate).toFixed(2));
    const totalAmountInr = parseFloat((platformFeeInr + gstAmount).toFixed(2));
    const amountPaise    = Math.round(totalAmountInr * 100);

    const merchantTransactionId = `MT-${uuidv4().replace(/-/g, '').slice(0, 30)}`;

    // Persist pending unlock record
    const unlock = await this.prisma.contactUnlock.upsert({
      where: { clientId_listingId: { clientId, listingId: dto.listingId } },
      update: {
        merchantTransactionId,
        platformFeeInr,
        gstAmount,
        totalAmountInr,
        status: UnlockStatus.PENDING,
      },
      create: {
        clientId,
        listingId:            dto.listingId,
        merchantTransactionId,
        platformFeeInr,
        gstAmount,
        totalAmountInr,
        status:    UnlockStatus.PENDING,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // Build PhonePe Pay payload
    const redirectUrl = `${this.frontendUrl}/payment/callback?txnId=${merchantTransactionId}`;
    const callbackUrl = `${this.configService.get('app.apiUrl') ?? 'http://localhost:3001'}/api/v1/payments/callback`;

    const payload = {
      merchantId:            this.merchantId,
      merchantTransactionId,
      merchantUserId:        `UID-${clientId.slice(-12)}`,
      amount:                amountPaise,
      redirectUrl,
      redirectMode:          'REDIRECT',
      callbackUrl,
      paymentInstrument:     { type: 'PAY_PAGE' },
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const apiPath       = '/pg/v1/pay';
    const xVerify       = this.buildXVerify(base64Payload, apiPath);

    const response = await fetch(`${this.baseUrl}${apiPath}`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'X-VERIFY':      xVerify,
        'X-MERCHANT-ID': this.merchantId,
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    const result: any = await response.json();

    if (!result.success) {
      this.logger.error('PhonePe order creation failed', result);
      throw new BadRequestException(result.message ?? 'Payment initiation failed');
    }

    const phonePeRedirectUrl: string =
      result.data?.instrumentResponse?.redirectInfo?.url;

    return {
      merchantTransactionId,
      unlockId:    unlock.id,
      redirectUrl: phonePeRedirectUrl,
      amount:      amountPaise,
      currency:    'INR',
      platformFeeInr,
      gstAmount,
      totalAmountInr,
    };
  }

  // ─── Verify payment status (poll from frontend) ────────────────────────────────

  async verifyPayment(clientId: string, dto: VerifyPaymentDto) {
    const { merchantTransactionId } = dto;

    const apiPath  = `/pg/v1/status/${this.merchantId}/${merchantTransactionId}`;
    const xVerify  = this.buildXVerifyGet(apiPath);

    const response = await fetch(`${this.baseUrl}${apiPath}`, {
      method:  'GET',
      headers: {
        'X-VERIFY':      xVerify,
        'X-MERCHANT-ID': this.merchantId,
        'Content-Type':  'application/json',
      },
    });

    const result: any = await response.json();

    if (!result.success || result.code !== 'PAYMENT_SUCCESS') {
      const code = result.code ?? 'PAYMENT_FAILED';
      throw new BadRequestException(`Payment not successful: ${code}`);
    }

    const unlock = await this.prisma.contactUnlock.findFirst({
      where: { merchantTransactionId, clientId },
    });

    if (!unlock) throw new NotFoundException('Payment record not found');
    if (unlock.status === UnlockStatus.SUCCESS) {
      // Idempotent — already verified
      return { success: true, invoiceNumber: unlock.invoiceNumber, unlockId: unlock.id, listingId: unlock.listingId };
    }

    const invoiceNumber = `INV-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`;
    const phonePeTransactionId: string = result.data?.transactionId ?? '';

    const updated = await this.prisma.contactUnlock.update({
      where: { id: unlock.id },
      data: {
        status:               UnlockStatus.SUCCESS,
        phonePeTransactionId,
        invoiceNumber,
        expiresAt:            new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await this.prisma.listing.update({
      where: { id: unlock.listingId },
      data:  { unlockCount: { increment: 1 } },
    });

    this.logger.log(`Unlock success: listing ${unlock.listingId} by client ${clientId}`);

    return {
      success:       true,
      invoiceNumber,
      unlockId:      updated.id,
      listingId:     unlock.listingId,
    };
  }

  // ─── PhonePe server-to-server callback (webhook) ──────────────────────────────

  async handleCallback(body: { response: string }) {
    try {
      const decoded       = Buffer.from(body.response, 'base64').toString('utf8');
      const data: any     = JSON.parse(decoded);
      const merchantTxnId = data.merchantTransactionId as string;

      if (!merchantTxnId) return;

      if (data.code === 'PAYMENT_SUCCESS' || data.state === 'COMPLETED') {
        const unlock = await this.prisma.contactUnlock.findFirst({
          where: { merchantTransactionId: merchantTxnId },
        });
        if (unlock && unlock.status !== UnlockStatus.SUCCESS) {
          const invoiceNumber = `INV-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`;
          await this.prisma.contactUnlock.update({
            where: { id: unlock.id },
            data: {
              status:               UnlockStatus.SUCCESS,
              phonePeTransactionId: data.transactionId ?? '',
              invoiceNumber,
            },
          });
          await this.prisma.listing.update({
            where: { id: unlock.listingId },
            data:  { unlockCount: { increment: 1 } },
          });
          this.logger.log(`Webhook: unlock confirmed for ${merchantTxnId}`);
        }
      }
    } catch (err) {
      this.logger.error('Callback parse error', err);
    }
  }

  // ─── Refund ────────────────────────────────────────────────────────────────────

  async requestRefund(clientId: string, unlockId: string, dto: RefundRequestDto) {
    const unlock = await this.prisma.contactUnlock.findUnique({ where: { id: unlockId } });

    if (!unlock)                        throw new NotFoundException('Unlock record not found');
    if (unlock.clientId !== clientId)   throw new ForbiddenException('Not your unlock');
    if (unlock.status !== UnlockStatus.SUCCESS) {
      throw new BadRequestException('Only successful unlocks can be refunded');
    }
    if (unlock.expiresAt && new Date() > unlock.expiresAt) {
      throw new BadRequestException('Refund window of 24 hours has passed');
    }

    // NOTE: PhonePe refund API requires a support call or dashboard action
    // at the moment; automated refund is tracked internally and processed manually.
    const updated = await this.prisma.contactUnlock.update({
      where: { id: unlockId },
      data:  { status: UnlockStatus.REFUNDED, refundReason: dto.reason, refundedAt: new Date() },
    });

    await this.prisma.listing.update({
      where: { id: unlock.listingId },
      data:  { unlockCount: { decrement: 1 } },
    });

    return { success: true, refundedAt: updated.refundedAt };
  }

  // ─── Revenue dashboard (admin) ────────────────────────────────────────────────

  async getRevenueSummary(from: Date, to: Date) {
    const unlocks = await this.prisma.contactUnlock.findMany({
      where: { status: UnlockStatus.SUCCESS, createdAt: { gte: from, lte: to } },
      select: {
        totalAmountInr: true,
        platformFeeInr: true,
        gstAmount:      true,
        createdAt:      true,
        listing:        { select: { city: true } },
      },
    });

    const totalRevenue = unlocks.reduce((s, u) => s + u.platformFeeInr, 0);
    const totalGst     = unlocks.reduce((s, u) => s + u.gstAmount, 0);

    const cityBreakdown: Record<string, number> = {};
    unlocks.forEach((u) => {
      const city = u.listing.city;
      cityBreakdown[city] = (cityBreakdown[city] ?? 0) + u.platformFeeInr;
    });

    return {
      totalUnlocks: unlocks.length,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalGst:     parseFloat(totalGst.toFixed(2)),
      cityBreakdown,
    };
  }
}
