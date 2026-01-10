import { SubscriptionTier } from '@/types/user';
import { cn } from '@/lib/utils';

interface SubscriptionBadgeProps {
  tier: SubscriptionTier;
  className?: string;
}

const tierConfig: Record<SubscriptionTier, { label: string; className: string }> = {
  free: {
    label: 'Free',
    className: 'bg-muted text-muted-foreground',
  },
  extended: {
    label: 'Extended',
    className: 'bg-primary/10 text-primary',
  },
  ultimate: {
    label: 'Ultimate',
    className: 'bg-accent text-accent-foreground border border-primary',
  },
  enterprise: {
    label: 'Enterprise',
    className: 'bg-primary text-primary-foreground',
  },
};

export const SubscriptionBadge = ({ tier, className }: SubscriptionBadgeProps) => {
  const config = tierConfig[tier];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};
