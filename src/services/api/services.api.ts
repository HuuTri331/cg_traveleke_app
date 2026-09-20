const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ServiceCategory {
  id: number;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  services?: RoomService[];
}

export interface RoomService {
  id: number;
  categoryId: number;
  hotelId: number | null;
  roomTypeId: number | null;
  name: string;
  description: string | null;
  unit: string;
  basePrice: number;
  isComplimentary: boolean;
  maxQuantity: number | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  category?: ServiceCategory;
}

export interface ServiceRequest {
  id: number;
  bookingId: number;
  serviceId: number;
  assignedTo: number | null;
  serviceName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  note: string | null;
  scheduledAt: string | null;
  completedAt: string | null;
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  service?: RoomService;
}

export interface ServiceStats {
  totalCategories: number;
  totalServices: number;
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body?.message || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const servicesApi = {
  // Categories
  getCategories: (includeInactive = false): Promise<ServiceCategory[]> =>
    fetch(`${BASE_URL}/services/categories?includeInactive=${includeInactive}`, {
      headers: getAuthHeaders(),
    }).then((r) => handleResponse<ServiceCategory[]>(r)),

  createCategory: (data: {
    code: string;
    name: string;
    description?: string;
    icon?: string;
    sortOrder?: number;
  }): Promise<ServiceCategory> =>
    fetch(`${BASE_URL}/services/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => handleResponse<ServiceCategory>(r)),

  updateCategory: (
    id: number,
    data: Partial<ServiceCategory>,
  ): Promise<ServiceCategory> =>
    fetch(`${BASE_URL}/services/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => handleResponse<ServiceCategory>(r)),

  deleteCategory: (id: number): Promise<{ message: string }> =>
    fetch(`${BASE_URL}/services/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then((r) => handleResponse<{ message: string }>(r)),

  // Room Services
  getRoomServices: (params?: {
    hotelId?: number;
    categoryId?: number;
  }): Promise<RoomService[]> => {
    const query = new URLSearchParams();
    if (params?.hotelId) query.set('hotelId', String(params.hotelId));
    if (params?.categoryId) query.set('categoryId', String(params.categoryId));
    return fetch(`${BASE_URL}/services/room-services?${query}`, {
      headers: getAuthHeaders(),
    }).then((r) => handleResponse<RoomService[]>(r));
  },

  createRoomService: (data: {
    categoryId: number;
    hotelId?: number;
    name: string;
    description?: string;
    unit?: string;
    basePrice?: number;
    isComplimentary?: boolean;
    maxQuantity?: number;
  }): Promise<RoomService> =>
    fetch(`${BASE_URL}/services/room-services`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => handleResponse<RoomService>(r)),

  updateRoomService: (id: number, data: Partial<RoomService>): Promise<RoomService> =>
    fetch(`${BASE_URL}/services/room-services/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => handleResponse<RoomService>(r)),

  deleteRoomService: (id: number): Promise<{ message: string }> =>
    fetch(`${BASE_URL}/services/room-services/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then((r) => handleResponse<{ message: string }>(r)),

  // Requests
  getRequests: (params?: { status?: string; assignedTo?: number }): Promise<ServiceRequest[]> => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.assignedTo) query.set('assignedTo', String(params.assignedTo));
    return fetch(`${BASE_URL}/services/requests?${query}`, {
      headers: getAuthHeaders(),
    }).then((r) => handleResponse<ServiceRequest[]>(r));
  },

  updateRequest: (
    id: number,
    data: { status?: string; assignedTo?: number; note?: string },
  ): Promise<ServiceRequest> =>
    fetch(`${BASE_URL}/services/requests/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => handleResponse<ServiceRequest>(r)),

  // Stats
  getStats: (): Promise<ServiceStats> =>
    fetch(`${BASE_URL}/services/stats`, {
      headers: getAuthHeaders(),
    }).then((r) => handleResponse<ServiceStats>(r)),
};
