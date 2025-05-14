// src/types/group.ts
export interface Group {
    id: number;
    name: string;
    description: string;
    created_at: string;
    target_amount: number;
    current_amount: number;
    progress: number;
    is_public: boolean;
    status: 'active' | 'archived' | 'pending';
    admin_id: number;
    meeting_schedule?: string;
    location?: string;
    logo_url?: string;
    member_count: number;
    members?: Member[];
  username: string;
  email: string;
  role: 'admin' | 'member';
  }
  
  export interface Member {
    id: number;
    user_id: number;
    group_id: number;
    role: 'admin' | 'moderator' | 'member';
    status: 'active' | 'pending' | 'inactive';
    joined_at: string;
    last_contribution?: string;
  }
  
  export interface Contribution {
    id: number;
    user_id: number;
    group_id: number;
    amount: number;
    date: string;
    payment_method: string;
  }
  
  export interface Invitation {
    id: number;
    group_id: number;
    email: string;
    token: string;
    status: 'pending' | 'accepted' | 'expired';
    created_at: string;
    expires_at: string;
  }
  // src/types/contribution.ts
export interface ContributionFormData {
  member_id: string;
  group_id: string;
  amount: string;
  note?: string;
  status?: string;
  receipt_number?: string;
}