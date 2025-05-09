export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  phone_number?: string | null; // Make it optional and nullable
  role?: 'admin' | 'member';
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  profile_picture?: string;
}
  
  export interface UserFormProps {
    user?: Partial<User>;
    onSubmit: (user: Partial<User>) => void;
    onCancel?: () => void;
  }
  
  export interface AlertProps {
    type: "success" | "error";
    message: string;
    onClose: () => void;
  }

  export interface paginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
    totalItems: number;
  }