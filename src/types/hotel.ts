export type HotelStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';

export interface HotelImage {
  id: string;
  hotelId: string;
  imageUrl: string;
  caption: string | null;
  sortOrder: number;
  isPrimary: number;
  createdAt: string;
}

export interface Hotel {
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
  images?: HotelImage[];
}

export interface CreateHotelInput {
  hotelTypeId: number;
  locationId: number;
  name: string;
  slug?: string;
  description?: string | null;
  starRating?: number | null;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  email?: string | null;
  checkInTime?: string;
  checkOutTime?: string;
  coverImageUrl?: string | null;
  status?: HotelStatus;
}

export interface UpdateHotelInput extends Partial<CreateHotelInput> {}

export interface QueryHotelParams {
  page?: number;
  perPage?: number;
  search?: string;
  status?: HotelStatus;
  hotelTypeId?: number;
  locationId?: number;
}
