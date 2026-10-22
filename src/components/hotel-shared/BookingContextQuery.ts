/**
 * Shared booking search & continuity query context helper
 * Ensures seamless propagation of:
 * / (Home Search)
 * -> /hotels_home?keyword=...&checkInAt=...&checkOutAt=...&roomCount=...&totalGuests=...
 * -> /hotels_home/:id?checkInAt=...&checkOutAt=...&roomCount=...&totalGuests=...
 * -> /process-order?hotelId=...&roomId=...&checkInAt=...&checkOutAt=...&roomCount=...&totalGuests=...
 */

export interface BookingQueryParams {
  keyword?: string;
  checkInAt?: string;
  checkOutAt?: string;
  roomCount?: number;
  totalGuests?: number;
}

/**
 * Returns default check-in (tomorrow 14:00) and check-out (day after tomorrow 12:00)
 */
export function getDefaultBookingDates(): { defaultCheckInIso: string; defaultCheckOutIso: string; checkInDateStr: string; checkOutDateStr: string } {
  const now = new Date();
  const checkIn = new Date(now);
  // Quy tắc Mục 02.9 & 07.2: Mặc định nhận phòng HÔM NAY (14:00)
  checkIn.setHours(14, 0, 0, 0);

  const checkOut = new Date(checkIn);
  // Mặc định trả phòng NGÀY MAI (12:00)
  checkOut.setDate(checkOut.getDate() + 1);
  checkOut.setHours(12, 0, 0, 0);

  const formatYmd = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  return {
    defaultCheckInIso: checkIn.toISOString(),
    defaultCheckOutIso: checkOut.toISOString(),
    checkInDateStr: formatYmd(checkIn),
    checkOutDateStr: formatYmd(checkOut),
  };
}

/**
 * Parses query params from URLSearchParams or search string
 */
export function parseBookingQueryParams(searchParams: URLSearchParams | { get: (k: string) => string | null }): BookingQueryParams {
  const keyword = searchParams.get('keyword') || undefined;
  const checkInAt = searchParams.get('checkInAt') || undefined;
  const checkOutAt = searchParams.get('checkOutAt') || undefined;
  const roomCountStr = searchParams.get('roomCount');
  const totalGuestsStr = searchParams.get('totalGuests');

  return {
    keyword,
    checkInAt,
    checkOutAt,
    roomCount: roomCountStr ? Math.max(1, parseInt(roomCountStr, 10)) : 1,
    totalGuests: totalGuestsStr ? Math.max(1, parseInt(totalGuestsStr, 10)) : 2,
  };
}

/**
 * Serializes booking params into URL search string
 */
export function buildBookingQueryString(params: BookingQueryParams, includeKeyword = true): string {
  const sp = new URLSearchParams();
  if (includeKeyword && params.keyword?.trim()) {
    sp.set('keyword', params.keyword.trim());
  }
  if (params.checkInAt) {
    sp.set('checkInAt', params.checkInAt);
  }
  if (params.checkOutAt) {
    sp.set('checkOutAt', params.checkOutAt);
  }
  if (params.roomCount) {
    sp.set('roomCount', String(params.roomCount));
  }
  if (params.totalGuests) {
    sp.set('totalGuests', String(params.totalGuests));
  }
  const str = sp.toString();
  return str ? `?${str}` : '';
}
