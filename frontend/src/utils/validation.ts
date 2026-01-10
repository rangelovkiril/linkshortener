export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required';
  if (!isValidEmail(email)) return 'Please enter a valid email address';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (!isValidPassword(password)) return 'Password must be at least 8 characters';
  return null;
};

export const validateUrl = (url: string): string | null => {
  if (!url) return 'URL is required';
  if (!isValidUrl(url)) return 'Please enter a valid URL';
  return null;
};

export const validateSlug = (slug: string): string | null => {
  if (!slug) return null; // Optional field
  if (slug.length < 3) return 'Slug must be at least 3 characters';
  if (!/^[a-zA-Z0-9-_]+$/.test(slug)) return 'Slug can only contain letters, numbers, hyphens, and underscores';
  return null;
};
