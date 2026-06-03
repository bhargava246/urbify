import { apiFetch } from '@/lib/api';
import { endpoints } from './endpoints';
import type { CreateOrderResponse, UnlockResult } from '@/types';

export interface VerifyPaymentPayload {
  merchantTransactionId: string;
}

export interface RevenueResponse {
  totalRevenue: number;
  totalGst: number;
  netRevenue: number;
  unlockCount: number;
  refundCount: number;
  cityBreakdown: { city: string; revenue: number; unlocks: number }[];
}

export const paymentsService = {
  /**
   * Step 1 – create a PhonePe order for unlocking a listing.
   * Returns { merchantTransactionId, redirectUrl, amount, ... }
   * The caller should then do: window.location.href = redirectUrl
   */
  async createOrder(listingId: string): Promise<CreateOrderResponse> {
    return apiFetch(endpoints.payments.createOrder, {
      method: 'POST',
      body: JSON.stringify({ listingId }),
    });
  },

  /**
   * Step 2 – verify payment status after PhonePe redirects back.
   * Called from /payment/callback?txnId=<merchantTransactionId>
   */
  async verifyPayment(payload: VerifyPaymentPayload): Promise<UnlockResult> {
    return apiFetch(endpoints.payments.verify, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /** Request a refund within 24 h */
  async requestRefund(unlockId: string, reason: string): Promise<{ success: boolean }> {
    return apiFetch(endpoints.payments.refund(unlockId), {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  /** [ADMIN] Revenue summary */
  async getRevenue(from: Date, to: Date): Promise<RevenueResponse> {
    const qs = new URLSearchParams({
      from: from.toISOString(),
      to:   to.toISOString(),
    });
    return apiFetch(`${endpoints.payments.revenue}?${qs}`);
  },

  /**
   * Full PhonePe unlock flow:
   *  1. createOrder  → get redirectUrl
   *  2. redirect to PhonePe payment page
   *  3. PhonePe redirects user back to /payment/callback?txnId=...
   *  4. callback page calls verifyPayment()
   *
   * This helper handles steps 1-2. It does NOT return — the browser navigates away.
   */
  async initiateCheckout(listingId: string): Promise<never> {
    const order = await paymentsService.createOrder(listingId);

    if (!order.redirectUrl) {
      throw new Error('Payment gateway did not return a redirect URL. Please try again.');
    }

    window.location.href = order.redirectUrl;
    // The browser navigates away — this line is never reached.
    return undefined as never;
  },
};
