export type AuthMethod = 'email' | 'phone' | 'google';
export type UserRole = 'citizen' | 'provider';

export type User = {
  id: number;
  name: string;
  phone: string;
  email?: string;
  language: string;
  role?: UserRole;
  providerServiceType?: ServiceType;
};

export type ProviderNode = {
  id: number;
  serviceType: ServiceType;
  facilityName: string;
  hotline: string;
  assets: string;
  registrationNumber?: string;
  address?: string;
  primaryHelpline?: string;
  secondaryHelpline?: string;
  adminName?: string;
  latitude: number;
  longitude: number;
  active: boolean;
  createdAt: string;
};

export type ServiceType = 'Police' | 'Hospital' | 'Traffic Police';

export type Incident = {
  id: number;
  user_id: number;
  type: string;
  severity: 'low' | 'moderate' | 'critical';
  description?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
};

export type ServiceRecord = {
  id: number;
  incident_id: number;
  service_type: string;
  provider?: string;
  phone?: string;
  status: 'pending' | 'sent' | 'completed';
};
