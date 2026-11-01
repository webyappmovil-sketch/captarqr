export type UserRole =
  | 'super_admin'
  | 'partner'
  | 'seller'
  | 'business_owner'
  | 'business_staff';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  partner_id: string | null;
  business_id: string | null;
  phone: string | null;
  avatar_url: string | null;
  preferred_language: 'es' | 'en' | 'pt';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface SessionUser {
  id: string;
  email: string;
  profile: Profile;
}
