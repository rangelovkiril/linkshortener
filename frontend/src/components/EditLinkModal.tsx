import { useState, useEffect } from 'react';
import { Link as LinkType, UpdateLinkRequest, ExpiryUnit } from '@/types/link';
import { useAuth } from '@/store/AuthContext';
import { useLinks } from '@/store/LinkContext';
import { validateUrl } from '@/utils/validation';
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

interface EditLinkModalProps {
  link: LinkType | null;
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

export const EditLinkModal = ({ link, open, onOpenChange }: EditLinkModalProps) => {
  const { user } = useAuth();
  const { updateLink } = useLinks();

  const [isLoading, setIsLoading] = useState(false);
  const [originalUrl, setOriginalUrl] = useState('');
  const [label, setLabel] = useState('');
  const [expiryValue, setExpiryValue] = useState<string>('');
  const [expiryUnit, setExpiryUnit] = useState<ExpiryUnit>('days');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const tier = user?.subscriptionTier || 'free';
  const canSetExpiry = tier !== 'free';

  useEffect(() => {
    if (link) {
      setOriginalUrl(link.originalUrl);
      setLabel(link.label || '');
      setExpiryValue('');
      setExpiryUnit('days');
      setErrors({});
    }
  }, [link]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const urlError = validateUrl(originalUrl);
    if (urlError) newErrors.originalUrl = urlError;

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

    if (!link || !validate()) return;

    setIsLoading(true);

    try {
      const data: UpdateLinkRequest = {
        originalUrl,
        label: label || undefined,
      };

      if (canSetExpiry && expiryValue) {
        data.expiryValue = parseInt(expiryValue, 10);
        data.expiryUnit = expiryUnit;
      }

      await updateLink(link.id, data);
      toast({
        title: 'Link updated!',
        description: 'Your changes have been saved.',
      });
      handleClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update link';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!link) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Link</DialogTitle>
          <DialogDescription>
            Update your shortened link settings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Short Code (read-only) */}
          <div className="space-y-2">
            <Label>Short Code</Label>
            <Input value={link.shortCode} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Short codes cannot be changed.</p>
          </div>

          {/* Original URL */}
          <div className="space-y-2">
            <Label htmlFor="editOriginalUrl">Original URL *</Label>
            <Input
              id="editOriginalUrl"
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
            <Label htmlFor="editLabel">Label (optional)</Label>
            <Input
              id="editLabel"
              placeholder="My awesome link"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Expiry Extension */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Extend Expiry</Label>
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
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
