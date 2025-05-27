// export interface User {
//     id: string;
//     username: string;
//     email: string;
//     role: 'admin' | 'member' | 'superadmin'; 
//   }
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'member' | 'superadmin';
  phone_number?: string;
  profile_picture?: string;
  created_at?: string;
  last_login?: string;
  is_active?: boolean;
  is_verified?: boolean;
}
