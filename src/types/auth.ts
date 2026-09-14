export type UserRole = 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER';
export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'INACTIVE';
export type UserGender = 'MALE' | 'FEMALE' | 'OTHER';

export interface UserRoleItem {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  isSystem: number;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  address?: string | null;
  avatarUrl: string | null;
  dateOfBirth?: string | null;
  gender?: UserGender | null;
  role: UserRole;
  status: UserStatus;
  isEmailVerified?: boolean;
  emailVerifiedAt?: string | null;
  lastLoginAt: string | null;
  createdAt?: string;
  updatedAt?: string;
  permissions?: string[];
  roles?: UserRoleItem[];
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponseData {
  access_token: string;
  token_type: string;
  expires_in: string;
  user: UserProfile;
}

export interface CreateStaffDto {
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: UserGender;
  role?: 'EMPLOYEE' | 'ADMIN';
}

export interface UpdateStaffDto {
  fullName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: UserGender;
  password?: string;
}

export interface AssignRoleDto {
  role: 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER';
}

export interface UpdateStatusDto {
  status: 'ACTIVE' | 'BLOCKED';
}
