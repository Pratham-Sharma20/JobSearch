import { UserRole } from '@/types/user.types';

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
  telegramChatId?: string;
  discordWebhookUrl?: string;
}

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken?: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}
