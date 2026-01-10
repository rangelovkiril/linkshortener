export type SubscriptionTier = 'free' | 'extended' | 'ultimate' | 'enterprise';
export type AuthProvider = 'local' | 'google' | 'github';

export interface User {
  id: string;
  email: string;
  authProvider: AuthProvider;
  subscriptionTier: SubscriptionTier;
  createdAt: string;
}

export interface AuthResponse {
  access_token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}
