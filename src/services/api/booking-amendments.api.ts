import { apiClient } from './client';

export const bookingAmendmentsApi = {
  async quoteAmendment(
    bookingId: string | number,
    payload: {
      newCheckInAt: string;
      newCheckOutAt: string;
      newRoomTypeId?: string;
      newQuantity?: number;
    },
  ) {
    const res = await apiClient.post(`/bookings/${bookingId}/amendments/quote`, payload);
    return res.data;
  },

  async createAmendment(
    bookingId: string | number,
    payload: {
      newCheckInAt: string;
      newCheckOutAt: string;
      newRoomTypeId?: string;
      newQuantity?: number;
      commandKey: string;
    },
  ) {
    const res = await apiClient.post(`/bookings/${bookingId}/amendments`, payload);
    return res.data;
  },

  async acceptAmendment(amendmentId: string | number) {
    const res = await apiClient.post(`/booking-amendments/${amendmentId}/accept`);
    return res.data;
  },

  async getBookingFolio(bookingId: string | number) {
    const res = await apiClient.get(`/bookings/${bookingId}/folio`);
    return res.data;
  },

  async recordFolioSettlement(
    folioId: string | number,
    payload: {
      method: string;
      amountVnd: number;
      providerRef: string;
      evidenceUrl?: string;
      commandId: string;
    },
  ) {
    const res = await apiClient.post(`/folios/${folioId}/settlements`, payload);
    return res.data;
  },

  async listBookingDocuments(bookingId: string | number) {
    const res = await apiClient.get(`/bookings/${bookingId}/documents`);
    return res.data;
  },
};
