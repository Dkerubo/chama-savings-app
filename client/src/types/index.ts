export interface User {
    id: number;
    username: string;
    email: string;
    role: "admin" | "member";
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
  