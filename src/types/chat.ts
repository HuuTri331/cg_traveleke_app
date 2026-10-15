export interface ChatFilters {
  intent: 'hotel_search' | 'general';
  location: string | null;
  starRating: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  adults: number | null;
  children: number | null;
  checkIn: string | null;
  checkOut: string | null;
}

export interface ChatHotelResult {
  hotelId: string;
  hotelName: string;
  starRating: number;
  address: string;
  hotelImage: string | null;

  locationId: string;
  locationCode: string;
  locationName: string;

  roomId: string;
  roomName: string;
  pricePerNight: string;

  maxAdults: number;
  maxChildren: number;

  totalRooms: number;
  remainingRooms: string;

  roomRating: string;
  roomImage: string | null;
}

export interface ChatResponse {
  success: boolean;
  userMessage: string;
  filters: ChatFilters;
  reply: string;
  results: ChatHotelResult[];
}

export interface ChatRequest {
  message: string;
}