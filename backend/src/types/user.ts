export interface UserResponse {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string | null;
  isActive: boolean;
  balanceCents: number;
  createdAt: string;
}
