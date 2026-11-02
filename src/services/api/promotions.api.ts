import { apiClient } from './client';

export interface PromotionCampaignItem {
  id: string;
  hotelId: string;
  code: string;
  name: string;
  description?: string | null;
  campaignType: string;
  status: string;
  chargeComponentType: string;
  targetScope: 'ALL_ROOMS' | 'ROOM_IDS' | 'ALL_SERVICES' | 'SERVICE_IDS';
  targetRoomIds?: string[] | null;
  targetServiceIds?: string[] | null;
  stayStartDate: string;
  stayEndExclusiveDate: string;
  serviceStartHour?: number | null;
  serviceEndHour?: number | null;
  discountType: 'PERCENT' | 'FIXED_AMOUNT' | 'SERVICE_CREDIT' | 'PACKAGE_FIXED';
  discountValue: number;
  floorPrice: number;
  maxDiscountPerNight?: number | null;
  maxDiscountPerBooking?: number | null;
  minNights: number;
  minRooms: number;
  minGuests: number;
  benefitKind: 'ROOM_PRICE_ADJUSTMENT' | 'SERVICE_BENEFIT_CREDIT' | 'INCLUDED_QUOTA';
  existingBookingsEligible: boolean;
  retroactiveMode: boolean;
  budgetTotal?: number | null;
  budgetReserved: number;
  budgetConsumed: number;
  redemptionsCount: number;
  version: number;
  createdAt: string;
}

export interface BookingBenefitFolioResponse {
  bookingId: string;
  bookingCode: string;
  hotelId: string;
  originalEstimatedTotal: number;
  refundReceivableAmount: number;
  availableServiceCredit: number;
  availableQuota: number;
  adjustmentRefundableWithoutConsent?: number;
  refundableButOffsetPermitted?: number;
  pureServiceVoucher?: number;
  pendingRefundSettlementAmount?: number;
  totalOutstandingLiability?: number;
  refundIntents?: Array<{
    id: string;
    amount: number;
    channel: string;
    status: string;
    providerRef?: string | null;
    payoutReceiptRef?: string | null;
    createdAt: string;
  }>;
  accounts: Array<{
    id: string;
    benefitKind: string;
    status: string;
    grantedAmount: number;
    redeemedAmount: number;
    reversedAmount: number;
    refundedAmount: number;
    availableAmount: number;
    grantedQuota: number;
    usedQuota: number;
    availableQuota: number;
    allowedServiceIds?: string[] | null;
    customerAcceptedCredit: boolean;
    note?: string | null;
  }>;
  ledger: Array<{
    id: string;
    entryType: string;
    amountDelta: number;
    balanceAfter: number;
    quotaDelta: number;
    quotaAfter: number;
    serviceRequestId?: string | null;
    performedBy?: string | null;
    reason?: string | null;
    occurredAt: string;
  }>;
}

export interface PriceQuoteResponse {
  id: string;
  quoteCode: string;
  hotelId: string;
  roomId: string;
  roomQuantity: number;
  totalGuests: number;
  checkInLocalDate: string;
  checkOutLocalDate: string;
  nightsCount: number;
  baseTotal: number;
  discountTotal: number;
  monetaryDiscountTotal?: number;
  noncashBenefitValue?: number;
  payableTotal: number;
  currency: string;
  priceHash: string;
  status: string;
  expiresAt: string;
  version: number;
  nightlyLines: Array<{
    nightDate: string;
    roomId: string;
    quantity: number;
    baseRatePerRoom: number;
    baseSubtotal: number;
    appliedCampaignId: string | null;
    appliedCampaignCode: string | null;
    appliedCampaignVersion: number | null;
    discountAmount: number;
    payableSubtotal: number;
  }>;
  appliedCampaigns?: Array<{
    campaignId: string;
    code: string;
    name: string;
    version: number;
    benefitKind: string;
    discountAmount: number;
    includedQuotas?: Array<{ serviceCode: string; serviceName: string; quantity: number }>;
  }> | null;
}

export const promotionsApi = {
  getPublicActiveCampaigns: async (hotelId: string | number): Promise<Partial<PromotionCampaignItem>[]> => {
    const res = await apiClient.get(`/promotions/hotels/${hotelId}/active`);
    return res.data;
  },

  getHotelCampaigns: async (hotelId: string | number): Promise<PromotionCampaignItem[]> => {
    const res = await apiClient.get(`/promotions/hotels/${hotelId}/campaigns`);
    return res.data;
  },

  createCampaign: async (payload: {
    hotelId: string;
    code: string;
    name: string;
    description?: string;
    campaignType?: string;
    chargeComponentType?: string;
    targetScope?: 'ALL_ROOMS' | 'ROOM_IDS' | 'ALL_SERVICES' | 'SERVICE_IDS';
    targetRoomIds?: string[];
    targetServiceIds?: string[];
    stayStartDate: string;
    stayEndDate?: string;
    stayEndExclusiveDate?: string;
    serviceStartHour?: number;
    serviceEndHour?: number;
    discountType?: 'PERCENT' | 'FIXED_AMOUNT' | 'SERVICE_CREDIT' | 'PACKAGE_FIXED';
    discountValue: number;
    floorPrice?: number;
    maxDiscountPerNight?: number;
    maxDiscountPerBooking?: number;
    minNights?: number;
    minRooms?: number;
    minGuests?: number;
    benefitKind?: 'ROOM_PRICE_ADJUSTMENT' | 'SERVICE_BENEFIT_CREDIT' | 'INCLUDED_QUOTA';
    existingBookingsEligible?: boolean;
    retroactiveMode?: boolean;
    budgetTotal?: number;
    maxRedemptions?: number;
    packageConfig?: {
      includedQuotas?: Array<{ serviceCode: string; serviceName: string; quantity: number }>;
      roomPriceDiscountPercent?: number;
      allocatedRoomIds?: string[];
    };
  }): Promise<{ campaign: PromotionCampaignItem; conflictWarnings: any[] }> => {
    const res = await apiClient.post('/promotions/campaigns', payload);
    return res.data;
  },

  previewCampaign: async (campaignId: string | number): Promise<{
    campaign: PromotionCampaignItem;
    canPublish: boolean;
    conflicts: Array<{ conflictingCampaignId: string; conflictingCode: string; conflictingName: string; reason: string }>;
  }> => {
    const res = await apiClient.post(`/promotions/campaigns/${campaignId}/preview`);
    return res.data;
  },

  activateCampaign: async (campaignId: string | number): Promise<PromotionCampaignItem> => {
    const res = await apiClient.post(`/promotions/campaigns/${campaignId}/activate`);
    return res.data;
  },

  pauseCampaign: async (campaignId: string | number, reason?: string): Promise<PromotionCampaignItem> => {
    const res = await apiClient.post(`/promotions/campaigns/${campaignId}/pause`, { reason });
    return res.data;
  },

  getReconciliation: async (hotelId: string | number) => {
    const res = await apiClient.get(`/promotions/hotels/${hotelId}/reconciliation`);
    return res.data;
  },

  calculateQuote: async (payload: {
    roomId: string;
    checkInAt: string;
    checkOutAt: string;
    roomCount?: number;
    totalGuests?: number;
  }): Promise<PriceQuoteResponse> => {
    const res = await apiClient.post('/promotions/quotes', payload);
    return res.data;
  },

  quoteServiceItem: async (payload: {
    hotelId: string;
    serviceId: string;
    baseUnitPrice: number;
    quantity?: number;
    usageAt?: string;
  }) => {
    const res = await apiClient.post('/promotions/service-quotes', payload);
    return res.data;
  },

  getBookingFolio: async (bookingId: string | number): Promise<BookingBenefitFolioResponse> => {
    const res = await apiClient.get(`/promotions/booking/${bookingId}/folio`);
    return res.data;
  },

  evaluateBookingBenefits: async (bookingId: string | number) => {
    const res = await apiClient.post(`/promotions/booking/${bookingId}/evaluate-benefits`);
    return res.data;
  },

  acceptRoomAdjustmentAsCredit: async (
    bookingId: string | number,
    accountId: string | number,
    payload?: { channel?: string; termsVersion?: string; evidenceRef?: string },
  ) => {
    const res = await apiClient.post(`/promotions/booking/${bookingId}/accounts/${accountId}/accept-credit`, payload || {});
    return res.data;
  },

  redeemBenefit: async (payload: {
    bookingId: string;
    serviceRequestId: string;
    requestedAmount?: number;
    requestedQuota?: number;
    serviceId?: string;
    idempotencyKey: string;
    reason?: string;
  }) => {
    const res = await apiClient.post('/promotions/redeem', payload);
    return res.data;
  },

  reverseServiceRedemption: async (bookingId: string | number, serviceRequestId: string | number, reason?: string) => {
    const res = await apiClient.post(`/promotions/booking/${bookingId}/service/${serviceRequestId}/reverse`, { reason });
    return res.data;
  },

  settleRefund: async (
    bookingId: string | number,
    accountId: string | number,
    payload?: {
      idempotencyKey?: string;
      channel?: 'VNPAY_PROVIDER' | 'BANK_TRANSFER_PROOF' | 'CASH_RECEIPT';
      payoutReceiptRef?: string;
      reason?: string;
    },
  ) => {
    const res = await apiClient.post(
      `/promotions/booking/${bookingId}/accounts/${accountId}/settle-refund`,
      payload || {},
    );
    return res.data;
  },
};
