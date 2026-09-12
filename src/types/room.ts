export type RoomStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'MAINTENANCE';

export interface RoomImage {
  id: string;
  roomId: string;
  imageUrl: string;
  caption: string | null;
  sortOrder: number;
  isPrimary: number;
  createdAt: string;
}

export interface Room {
  id: string;
  hotelId: string;
  name: string;
  slug: string;
  description: string | null;
  pricePerNight: string;
  checkInTime: string;
  checkOutTime: string;
  maxAdults: number;
  maxChildren: number;
  totalRooms: number;
  availableRooms: number;
  bedCount: number;
  bedType: string;
  roomSize: number | null;
  rating: string;
  reviewCount: number;
  coverImageUrl: string | null;
  status: RoomStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  images?: RoomImage[];
}

export interface CreateRoomInput {
  hotelId: number;
  name: string;
  slug?: string;
  description?: string | null;
  pricePerNight: number;
  checkInTime?: string;
  checkOutTime?: string;
  maxAdults?: number;
  maxChildren?: number;
  totalRooms?: number;
  availableRooms?: number;
  bedCount?: number;
  bedType?: string;
  roomSize?: number | null;
  rating?: number;
  reviewCount?: number;
  coverImageUrl?: string | null;
  status?: RoomStatus;
}

export interface UpdateRoomInput extends Partial<CreateRoomInput> {}

export interface QueryRoomParams {
  page?: number;
  perPage?: number;
  hotelId?: number;
  search?: string;
  status?: RoomStatus;
  minPrice?: number;
  maxPrice?: number;
  adults?: number;
  children?: number;
}

export interface RoomSearchParams {
  keyword?: string;

  hotelId?: number;

  minPrice?: number;
  maxPrice?: number;

  maxAdults?: number;
  maxChildren?: number;

  bedType?: string;

  minRating?: number;

  status?: RoomStatus;

  page?: number;
  limit?: number;
}

export interface RoomSearchResponse {
  data: Room[];

  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}