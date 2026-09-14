export type HotelStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'INACTIVE';

export interface HotelSearchItem {
  id: string;
  hotelTypeId: string;
  locationId: string;
  createdBy: string | null;

  name: string;
  slug: string;
  description: string | null;

  starRating: number | null;

  address: string;

  latitude: string | null;
  longitude: string | null;

  phone: string | null;
  email: string | null;

  checkInTime: string;
  checkOutTime: string;

  coverImageUrl: string | null;

  status: HotelStatus;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface SearchHotelParams {
  keyword?: string;
  locationId?: string;
  hotelTypeId?: string;
  starRating?: number;
  status?: HotelStatus;
  page?: number;
  perPage?: number;
}

export interface HotelSearchMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface HotelSearchResponse {
  data: HotelSearchItem[];
  meta: HotelSearchMeta;
}