import { apiClient } from './client';

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
  certificateExpiry?: string | null;
  note: string | null;
  verifiedBy: number | null;
  verifiedAt: string | null;
  isShadow?: boolean;
  shadowMentorId?: number | null;
  eligibilityLevel?: 'TRAINING' | 'STANDARD' | 'SENIOR' | 'VIP' | 'COMPLEX';
  createdAt: string;
  skill?: SkillCategory;
}

export interface StaffLanguageSkill {
  id: number;
  userId: number;
  languageCode: string;
  languageName: string;
  level: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'NATIVE';
  certificate: string | null;
  certificateExpiry: string | null;
  verifiedBy: number | null;
  verifiedAt: string | null;
  createdAt: string;
}

export interface StaffEligibilityRule {
  id: number;
  ruleCode: string;
  caseComplexity: 'STANDARD' | 'PREMIUM' | 'VIP' | 'COMPLEX';
  description: string | null;
  minSkillLevel: number;
  requiredSkillCodes: string[] | null;
  requiredLanguageCodes: string[] | null;
  requireVerifiedSkills: boolean;
  excludeShadowMode: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface SkillStats {
  totalSkillCategories: number;
  staffWithSkills: number;
  averageSkillLevel: number;
  topSkill: string | null;
  staffWithLanguages?: number;
  expiringSoonCertificates?: number;
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

export const staffSkillsApi = {
  // Skill Categories
  getCategories: async (includeInactive = false): Promise<SkillCategory[]> => {
    const res = await apiClient.get('/staff-skills/categories', {
      params: { includeInactive: String(includeInactive) },
    });
    return res.data;
  },

  createCategory: async (data: {
    code: string;
    name: string;
    description?: string;
    department?: string;
  }): Promise<SkillCategory> => {
    const res = await apiClient.post('/staff-skills/categories', data);
    return res.data;
  },

  updateCategory: async (
    id: number,
    data: { name?: string; description?: string; department?: string; status?: 'ACTIVE' | 'INACTIVE' },
  ): Promise<SkillCategory> => {
    const res = await apiClient.put(`/staff-skills/categories/${id}`, data);
    return res.data;
  },

  // Staff Skill Map
  getSkillsByUser: async (userId: number): Promise<StaffSkill[]> => {
    const res = await apiClient.get(`/staff-skills/user/${userId}`);
    return res.data;
  },

  upsertSkill: async (
    userId: number,
    data: {
      skillId: number;
      level: number;
      yearsExp?: number;
      certificate?: string;
      certificateExpiry?: string;
      note?: string;
      eligibilityLevel?: string;
    },
  ): Promise<StaffSkill> => {
    const res = await apiClient.post(`/staff-skills/user/${userId}`, data);
    return res.data;
  },

  removeSkill: async (userId: number, skillId: number): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/staff-skills/user/${userId}/skill/${skillId}`);
    return res.data;
  },

  verifySkill: async (entryId: number): Promise<StaffSkill> => {
    const res = await apiClient.post(`/staff-skills/verify/${entryId}`);
    return res.data;
  },

  // Language Skills
  getLanguagesByUser: async (userId: number): Promise<StaffLanguageSkill[]> => {
    const res = await apiClient.get(`/staff-skills/user/${userId}/languages`);
    return res.data;
  },

  upsertLanguage: async (
    userId: number,
    data: {
      languageCode: string;
      languageName: string;
      level: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'NATIVE';
      certificate?: string;
      certificateExpiry?: string;
    },
  ): Promise<StaffLanguageSkill> => {
    const res = await apiClient.post(`/staff-skills/user/${userId}/languages`, data);
    return res.data;
  },

  removeLanguage: async (userId: number, languageCode: string): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/staff-skills/user/${userId}/languages/${languageCode}`);
    return res.data;
  },

  // Eligibility Rules
  getEligibilityRules: async (): Promise<StaffEligibilityRule[]> => {
    const res = await apiClient.get('/staff-skills/eligibility-rules');
    return res.data;
  },

  checkEligibility: async (data: {
    userId: number;
    caseComplexity: 'STANDARD' | 'PREMIUM' | 'VIP' | 'COMPLEX';
    requiredLanguage?: string;
  }): Promise<{ eligible: boolean; reasons: string[] }> => {
    const res = await apiClient.post('/staff-skills/check-eligibility', data);
    return res.data;
  },

  // Smart Assignment
  suggestStaff: async (params: {
    skillCode: string;
    level: number;
    hotelId?: number;
  }): Promise<SuggestedStaff[]> => {
    const res = await apiClient.get('/staff-skills/suggest', { params });
    return res.data;
  },

  // Stats
  getStats: async (): Promise<SkillStats> => {
    const res = await apiClient.get('/staff-skills/stats');
    return res.data;
  },
};
