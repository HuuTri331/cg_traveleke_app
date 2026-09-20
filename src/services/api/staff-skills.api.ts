const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface SkillCategory {
  id: number;
  code: string;
  name: string;
  description: string | null;
  department: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface StaffSkill {
  id: number;
  userId: number;
  skillId: number;
  level: number; // 1-5
  yearsExp: number | null;
  certificate: string | null;
  note: string | null;
  verifiedBy: number | null;
  verifiedAt: string | null;
  createdAt: string;
  skill?: SkillCategory;
}

export interface SkillStats {
  totalSkillCategories: number;
  staffWithSkills: number;
  averageSkillLevel: number;
  topSkill: string | null;
}

export interface SuggestedStaff {
  userId: number;
  staffName: string;
  staffEmail: string;
  level: number;
  yearsExp: number | null;
  certificate: string | null;
  matchScore: number;
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

export const staffSkillsApi = {
  // Skill Categories
  getCategories: (includeInactive = false): Promise<SkillCategory[]> =>
    fetch(`${BASE_URL}/staff-skills/categories?includeInactive=${includeInactive}`, {
      headers: getAuthHeaders(),
    }).then((r) => handleResponse<SkillCategory[]>(r)),

  createCategory: (data: {
    code: string;
    name: string;
    description?: string;
    department?: string;
  }): Promise<SkillCategory> =>
    fetch(`${BASE_URL}/staff-skills/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => handleResponse<SkillCategory>(r)),

  updateCategory: (
    id: number,
    data: { name?: string; description?: string; department?: string; status?: 'ACTIVE' | 'INACTIVE' },
  ): Promise<SkillCategory> =>
    fetch(`${BASE_URL}/staff-skills/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => handleResponse<SkillCategory>(r)),

  // Staff Skill Map
  getSkillsByUser: (userId: number): Promise<StaffSkill[]> =>
    fetch(`${BASE_URL}/staff-skills/user/${userId}`, {
      headers: getAuthHeaders(),
    }).then((r) => handleResponse<StaffSkill[]>(r)),

  upsertSkill: (
    userId: number,
    data: { skillId: number; level: number; yearsExp?: number; certificate?: string; note?: string },
  ): Promise<StaffSkill> =>
    fetch(`${BASE_URL}/staff-skills/user/${userId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }).then((r) => handleResponse<StaffSkill>(r)),

  removeSkill: (userId: number, skillId: number): Promise<{ message: string }> =>
    fetch(`${BASE_URL}/staff-skills/user/${userId}/skill/${skillId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then((r) => handleResponse<{ message: string }>(r)),

  verifySkill: (entryId: number): Promise<StaffSkill> =>
    fetch(`${BASE_URL}/staff-skills/verify/${entryId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    }).then((r) => handleResponse<StaffSkill>(r)),

  // Smart Assignment
  suggestStaff: (params: {
    skillCode: string;
    level: number;
    hotelId?: number;
  }): Promise<SuggestedStaff[]> => {
    const query = new URLSearchParams({
      skillCode: params.skillCode,
      level: String(params.level),
    });
    if (params.hotelId) query.set('hotelId', String(params.hotelId));
    return fetch(`${BASE_URL}/staff-skills/suggest?${query}`, {
      headers: getAuthHeaders(),
    }).then((r) => handleResponse<SuggestedStaff[]>(r));
  },

  // Stats
  getStats: (): Promise<SkillStats> =>
    fetch(`${BASE_URL}/staff-skills/stats`, {
      headers: getAuthHeaders(),
    }).then((r) => handleResponse<SkillStats>(r)),
};
