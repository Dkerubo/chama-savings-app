// User Interfaces
export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  phone_number?: string | null;
  role: 'admin' | 'member' | 'superadmin';
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  last_login?: string;
  is_active?: boolean;
  is_verified?: boolean;
  profile_picture?: string;
  verification_token?: string;
  reset_token?: string;
  reset_token_expiry?: string;
  group?: {
    id: number;
    name: string;
    updated_at: string;
  };
}

export interface UserFormProps {
  user?: Partial<User>;
  onSubmit: (user: Partial<User>) => void;
  onCancel?: () => void;
}

// Group Interfaces
export interface Group {
  id: number;
  name: string;
  description: string;
  target_amount: number;
  current_amount?: number;
  is_public: boolean;
  status: 'active' | 'inactive' | 'completed';
  admin_id: number;
  admin_name?: string;
  created_at?: string;
  meeting_schedule: string;
  location: string;
  logo_url?: string;
  progress?: number;
  member_count?: number;
}

// Contribution Interfaces
export interface Contribution {
  id: number;
  member_id: number;
  group_id: number;
  amount: number;
  note: string;
  created_at: string;
  status: 'pending' | 'confirmed' | 'rejected';
  receipt_number: string;
  member_name?: string | null;
}

// Member Interfaces
export interface Member {
  id: number;
  user_id: number;
  group_id: number;
  role: 'member' | 'admin';
  joined_at?: string;
  user?: User;
  group?: Group;
}

// Component Props
export interface AlertProps {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

// Auth Context
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
}