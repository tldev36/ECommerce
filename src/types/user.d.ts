// 📂 src/types/user.d.ts
export interface User {
  id: number;
  username?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  gender?: string | null;
  birthday?: Date | null;
  avatar?: string | null;
  is_active?: boolean;
  role?: string;
  created_at?: Date;
  updated_at?: Date;
}
