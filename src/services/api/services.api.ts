import { apiClient } from './client';

export type ServiceType = 'INCLUDED' | 'ADD_ON' | 'QUOTA' | 'MINIBAR' | 'OPERATIONAL';

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
  serviceType: ServiceType;
  quotaPerBooking: number | null;
  quotaPerNight: number | null;
  maxQuantity: number | null;
  slaMinutes: number | null;
  capacityPerHour: number | null;
  leadTimeHours: number;
  requiresApproval: boolean;
  departmentOwner: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  category?: ServiceCategory;
}

export type ServiceRequestStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CONFIRMED'
  | 'FAILED'
  | 'CANCELLED';

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
  slaDueAt: string | null;
  isSlaBreahed: boolean;
  acceptedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  confirmedAt: string | null;
  failureReason: string | null;
  recoveryAction: string | null;
  recoveryCost: number | null;
  status: ServiceRequestStatus;
  createdAt: string;
  service?: RoomService;
}

export interface BookingServiceSnapshot {
  id: number;
  bookingId: number;
  serviceId: number;
  serviceName: string;
  serviceType: ServiceType;
  categoryName: string | null;
  unit: string;
  basePrice: number;
  isComplimentary: boolean;
  quotaIncluded: number | null;
  quotaPerNight: number | null;
  createdAt: string;
}

export interface ServiceRecoveryLog {
  id: number;
  serviceRequestId: number | null;
  bookingId: number;
  reportedBy: number;
  approvedBy: number | null;
  recoveryType: 'COMPLIMENTARY' | 'WAIVE' | 'UPGRADE' | 'COMPENSATION' | 'APOLOGY';
  reason: string;
  actionTaken: string;
  costIncurred: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface ServiceStats {
  totalCategories: number;
  totalServices: number;
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  breachedSlaRequests?: number;
}

export const servicesApi = {
  // Categories
  getCategories: async (includeInactive = false): Promise<ServiceCategory[]> => {
    const res = await apiClient.get('/services/categories', {
      params: { includeInactive: String(includeInactive) },
    });
    return res.data;
  },

  getCategoryById: async (id: number): Promise<ServiceCategory> => {
    const res = await apiClient.get(`/services/categories/${id}`);
    return res.data;
  },

  createCategory: async (data: {
    code: string;
    name: string;
    description?: string;
    icon?: string;
    sortOrder?: number;
  }): Promise<ServiceCategory> => {
    const res = await apiClient.post('/services/categories', data);
    return res.data;
  },

  updateCategory: async (
    id: number,
    data: Partial<ServiceCategory>,
  ): Promise<ServiceCategory> => {
    const res = await apiClient.put(`/services/categories/${id}`, data);
    return res.data;
  },

  deleteCategory: async (id: number): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/services/categories/${id}`);
    return res.data;
  },

  // Room Services
  getRoomServices: async (params?: {
    hotelId?: number;
    categoryId?: number;
  }): Promise<RoomService[]> => {
    const res = await apiClient.get('/services/room-services', { params });
    return res.data;
  },

  getRoomServiceById: async (id: number): Promise<RoomService> => {
    const res = await apiClient.get(`/services/room-services/${id}`);
    return res.data;
  },

  createRoomService: async (data: Partial<RoomService>): Promise<RoomService> => {
    const res = await apiClient.post('/services/room-services', data);
    return res.data;
  },

  updateRoomService: async (id: number, data: Partial<RoomService>): Promise<RoomService> => {
    const res = await apiClient.put(`/services/room-services/${id}`, data);
    return res.data;
  },

  deleteRoomService: async (id: number): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/services/room-services/${id}`);
    return res.data;
  },

  // Service Requests & Lifecycle
  getRequests: async (params?: {
    status?: string;
    assignedTo?: number;
    hotelId?: number;
  }): Promise<ServiceRequest[]> => {
    const res = await apiClient.get('/services/requests', { params });
    return res.data;
  },

  getRequestsByBooking: async (bookingId: number): Promise<ServiceRequest[]> => {
    const res = await apiClient.get(`/services/requests/booking/${bookingId}`);
    return res.data;
  },

  createServiceRequest: async (data: {
    bookingId: number;
    serviceId: number;
    quantity?: number;
    note?: string;
    scheduledAt?: string;
  }): Promise<ServiceRequest> => {
    const res = await apiClient.post('/services/requests', data);
    return res.data;
  },

  updateRequest: async (
    id: number,
    data: {
      status?: ServiceRequestStatus;
      assignedTo?: number;
      note?: string;
      completedAt?: string;
      confirmedAt?: string;
      failureReason?: string;
      recoveryAction?: string;
      recoveryCost?: number;
    },
  ): Promise<ServiceRequest> => {
    const res = await apiClient.put(`/services/requests/${id}`, data);
    return res.data;
  },

  updateRequestStatus: async (
    id: number,
    status: ServiceRequestStatus,
    payload?: {
      assignedTo?: number;
      failureReason?: string;
      note?: string;
    },
  ): Promise<ServiceRequest> => {
    const res = await apiClient.put(`/services/requests/${id}/status`, {
      status,
      ...payload,
    });
    return res.data;
  },

  // Booking Service Snapshots
  createBookingSnapshots: async (data: {
    bookingId: number;
    roomTypeId?: number;
    hotelId?: number;
  }): Promise<BookingServiceSnapshot[]> => {
    const res = await apiClient.post('/services/snapshots/create', data);
    return res.data;
  },

  getBookingSnapshots: async (bookingId: number): Promise<BookingServiceSnapshot[]> => {
    const res = await apiClient.get(`/services/snapshots/booking/${bookingId}`);
    return res.data;
  },

  // Service Recovery
  createRecoveryLog: async (data: {
    serviceRequestId?: number;
    bookingId: number;
    reportedBy?: number;
    recoveryType: 'COMPLIMENTARY' | 'WAIVE' | 'UPGRADE' | 'COMPENSATION' | 'APOLOGY';
    reason: string;
    actionTaken: string;
    costIncurred?: number;
  }): Promise<ServiceRecoveryLog> => {
    const res = await apiClient.post('/services/recovery', data);
    return res.data;
  },

  approveRecovery: async (
    id: number,
    decision: 'APPROVED' | 'REJECTED',
  ): Promise<ServiceRecoveryLog> => {
    const res = await apiClient.put(`/services/recovery/${id}/approve`, { decision });
    return res.data;
  },

  getRecoveryLogs: async (bookingId?: number): Promise<ServiceRecoveryLog[]> => {
    const res = await apiClient.get('/services/recovery', {
      params: bookingId ? { bookingId } : undefined,
    });
    return res.data;
  },

  // Stats
  getStats: async (): Promise<ServiceStats> => {
    const res = await apiClient.get('/services/stats');
    return res.data;
  },
};
