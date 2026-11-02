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

export const promotionsApi = {
  getHotelCampaigns: async (hotelId: string | number): Promise<PromotionCampaignItem[]> => {
    const res = await apiClient.get(`/promotions/hotel/${hotelId}/campaigns`);
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
    stayStartDate: string;
    stayEndDate?: string;
    stayEndExclusiveDate?: string;
    discountType?: 'PERCENT' | 'FIXED_AMOUNT' | 'SERVICE_CREDIT' | 'PACKAGE_FIXED';
    discountValue: number;
    floorPrice?: number;
    minNights?: number;
    benefitKind?: 'ROOM_PRICE_ADJUSTMENT' | 'SERVICE_BENEFIT_CREDIT' | 'INCLUDED_QUOTA';
    existingBookingsEligible?: boolean;
    retroactiveMode?: boolean;
    budgetTotal?: number;
  }): Promise<{ campaign: PromotionCampaignItem; conflictWarnings: any[] }> => {
    const res = await apiClient.post('/promotions/campaigns', payload);
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

  calculateQuote: async (payload: {
    roomId: string;
    checkInAt: string;
    checkOutAt: string;
    roomCount?: number;
    totalGuests?: number;
  }) => {
    const res = await apiClient.post('/promotions/quotes', payload);
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

  acceptRoomAdjustmentAsCredit: async (bookingId: string | number, accountId: string | number) => {
    const res = await apiClient.post(`/promotions/booking/${bookingId}/accounts/${accountId}/accept-credit`);
    return res.data;
  },

  redeemBenefit: async (payload: {
    bookingId: string;
    requestedAmount?: number;
    requestedQuota?: number;
    serviceRequestId?: string;
    idempotencyKey: string;
    reason?: string;
    customerAgreedToOffset?: boolean;
  }) => {
    const res = await apiClient.post('/promotions/redeem', payload);
    return res.data;
  },
};
