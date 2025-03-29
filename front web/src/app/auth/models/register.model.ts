export type UserRole = 'PLAYER' | 'OWNER';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}
