export type ExpiryUnit = 'minutes' | 'hours' | 'days' | 'months' | 'years';

export interface Link {
  id: string;
  shortCode: string;
  originalUrl: string;
  label?: string;
  expiresAt: string;
  isCustomSlug: boolean;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnonymousLinkRequest {
  originalUrl: string;
}

export interface CreateLinkRequest {
  originalUrl: string;
  label?: string;
  customSlug?: string;
  expiryValue?: number;
  expiryUnit?: ExpiryUnit;
}

export interface UpdateLinkRequest {
  label?: string;
  originalUrl?: string;
  expiryValue?: number;
  expiryUnit?: ExpiryUnit;
}
