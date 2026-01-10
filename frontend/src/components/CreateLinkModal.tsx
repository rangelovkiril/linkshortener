import { useState } from 'react';
import { useAuth } from '@/store/AuthContext';
import { useLinks } from '@/store/LinkContext';
import { CreateLinkRequest, ExpiryUnit } from '@/types/link';
import { validateUrl, validateSlug } from '@/utils/validation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader } from './Loader';
import { Lock, AlertCircle, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface CreateLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const expiryUnits: { value: ExpiryUnit; label: string }[] = [
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'months', label: 'Months' },
  { value: 'years', label: 'Years' },
];

export const CreateLinkModal = ({ open, onOpenChange }: CreateLinkModalProps) => {
  const { user } = useAuth();
  const { createLink } = useLinks();

  const [isLoading, setIsLoading] = useState(false);
  const [originalUrl, setOriginalUrl] = useState('');
  const [label, setLabel] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [expiryValue, setExpiryValue] = useState<string>('');
  const [expiryUnit, setExpiryUnit] = useState<ExpiryUnit>('days');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const tier = user?.subscriptionTier || 'free';
  const canUseCustomSlug = tier !== 'free';
  const canSetExpiry = tier !== 'free';

  const resetForm = () => {
    setOriginalUrl('');
    setLabel('');
    setCustomSlug('');
    setExpiryValue('');
    setExpiryUnit('days');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const urlError = validateUrl(originalUrl);
    if (urlError) newErrors.originalUrl = urlError;

    if (canUseCustomSlug && customSlug) {
      const slugError = validateSlug(customSlug);
      if (slugError) newErrors.customSlug = slugError;
    }

    if (canSetExpiry && expiryValue) {
      const value = parseInt(expiryValue, 10);
      if (isNaN(value) || value <= 0) {
        newErrors.expiryValue = 'Please enter a valid number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    try {
      const data: CreateLinkRequest = {
        originalUrl,
        label: label || undefined,
      };

      if (canUseCustomSlug && customSlug) {
        data.customSlug = customSlug;
      }

      if (canSetExpiry && expiryValue) {
        data.expiryValue = parseInt(expiryValue, 10);
        data.expiryUnit = expiryUnit;
      }

      await createLink(data);
      toast({
        title: 'Link created!',
        description: 'Your shortened link is ready to use.',
      });
      handleClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create link';
      
      if (message.includes('slug already taken') || message.includes('409')) {
        setErrors({ customSlug: 'This custom slug is already taken' });
      } else if (message.includes('403') || message.includes('tier')) {
        toast({
          title: 'Upgrade Required',
          description: 'This feature requires a higher subscription tier.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Link</DialogTitle>
          <DialogDescription>
            Shorten a URL and optionally customize it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Original URL */}
          <div className="space-y-2">
            <Label htmlFor="originalUrl">Original URL *</Label>
            <Input
              id="originalUrl"
              type="url"
              placeholder="https://example.com/your-long-url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              disabled={isLoading}
            />
            {errors.originalUrl && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.originalUrl}
              </p>
            )}
          </div>

          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="label">Label (optional)</Label>
            <Input
              id="label"
              placeholder="My awesome link"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Custom Slug */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="customSlug">Custom Slug</Label>
              {!canUseCustomSlug && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  Extended+
                </span>
              )}
            </div>
            <Input
              id="customSlug"
              placeholder="my-custom-link"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              disabled={isLoading || !canUseCustomSlug}
            />
            {!canUseCustomSlug && (
              <p className="text-xs text-muted-foreground">
                <Link to="/pricing" className="text-primary hover:underline inline-flex items-center gap-1">
                  Upgrade to Extended <ArrowUpRight className="h-3 w-3" />
                </Link>{' '}
                to use custom slugs.
              </p>
            )}
            {errors.customSlug && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.customSlug}
              </p>
            )}
          </div>

          {/* Expiry */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Custom Expiry</Label>
              {!canSetExpiry && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  Extended+
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="30"
                min="1"
                value={expiryValue}
                onChange={(e) => setExpiryValue(e.target.value)}
                disabled={isLoading || !canSetExpiry}
                className="flex-1"
              />
              <Select
                value={expiryUnit}
                onValueChange={(value) => setExpiryUnit(value as ExpiryUnit)}
                disabled={isLoading || !canSetExpiry}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {expiryUnits.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!canSetExpiry && (
              <p className="text-xs text-muted-foreground">
                <Link to="/pricing" className="text-primary hover:underline inline-flex items-center gap-1">
                  Upgrade to Extended <ArrowUpRight className="h-3 w-3" />
                </Link>{' '}
                to set custom expiry.
              </p>
            )}
            {errors.expiryValue && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.expiryValue}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader size="sm" className="mr-2" /> : null}
              Create Link
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
