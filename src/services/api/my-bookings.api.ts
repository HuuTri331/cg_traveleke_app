import { apiClient } from './client';

export const myBookingsApi = {
  async applyVoucherToQuote(quoteId: string | number, code: string) {
    const res = await apiClient.post(`/booking-price-quotes/${quoteId}/voucher`, { code });
    return res.data;
  },

  async requestPrecheckinInvite(bookingId: string | number) {
    const res = await apiClient.post(`/bookings/${bookingId}/precheckin/invite`);
    return res.data;
  },

  async submitPrecheckinByToken(
    opaqueToken: string,
    payload: {
      eta?: string;
      arrivalTransport?: string;
      bedPreference?: string;
      specialRequests?: string;
      commandId?: string;
    },
  ) {
    const res = await apiClient.post(`/precheckin/${opaqueToken}/submit`, payload);
    return res.data;
  },

  async updateOccupants(
    bookingId: string | number,
    payload: {
      occupants: Array<{
        fullName: string;
        contactRole?: 'BOOKER' | 'PAYER' | 'LEAD_GUEST' | 'OCCUPANT';
        isAdult?: boolean;
        childAge?: number;
        phone?: string;
        leadGuest?: boolean;
      }>;
      commandId: string;
      expectedVersion?: number;
    },
  ) {
    const res = await apiClient.put(`/bookings/${bookingId}/occupants`, payload);
    return res.data;
  },
};
