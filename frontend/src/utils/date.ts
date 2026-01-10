import { format, formatDistanceToNow, isPast } from 'date-fns';

export const formatDate = (dateString: string): string => {
  return format(new Date(dateString), 'MMM d, yyyy');
};

export const formatDateTime = (dateString: string): string => {
  return format(new Date(dateString), 'MMM d, yyyy h:mm a');
};

export const formatRelativeTime = (dateString: string): string => {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
};

export const isExpired = (dateString: string): boolean => {
  return isPast(new Date(dateString));
};

export const getExpiryStatus = (dateString: string): { label: string; isExpired: boolean } => {
  const expired = isExpired(dateString);
  if (expired) {
    return { label: 'Expired', isExpired: true };
  }
  return { label: `Expires ${formatRelativeTime(dateString)}`, isExpired: false };
};
