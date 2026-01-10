import { useState } from 'react';
import { Link } from '@/types/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  Pencil, 
  Trash2, 
  BarChart3,
  Lock
} from 'lucide-react';
import { getExpiryStatus, formatDate } from '@/utils/date';
import { cn } from '@/lib/utils';
import { useAuth } from '@/store/AuthContext';

interface LinkCardProps {
  link: Link;
  onEdit: (link: Link) => void;
  onDelete: (link: Link) => void;
  onViewStats: (link: Link) => void;
}

export const LinkCard = ({ link, onEdit, onDelete, onViewStats }: LinkCardProps) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const shortUrl = `${baseUrl.replace('/api', '')}/api/links/${link.shortCode}`;
  
  const expiryStatus = getExpiryStatus(link.expiresAt);
  const canViewStats = user?.subscriptionTier === 'ultimate' || user?.subscriptionTier === 'enterprise';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className={cn(
      'transition-all hover:shadow-md',
      expiryStatus.isExpired && 'opacity-60'
    )}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          {/* Header: Label and Actions */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {link.label && (
                <h3 className="font-medium text-foreground truncate">{link.label}</h3>
              )}
              <p className="text-sm text-muted-foreground truncate">{link.originalUrl}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" onClick={() => onEdit(link)} title="Edit">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onDelete(link)} 
                className="text-destructive hover:text-destructive"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Short URL */}
          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
            <code className="flex-1 text-sm font-mono truncate">{shortUrl}</code>
            <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy URL">
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="icon" asChild title="Open URL">
              <a href={shortUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>

          {/* Footer: Expiry and Stats */}
          <div className="flex items-center justify-between text-sm">
            <span className={cn(
              expiryStatus.isExpired ? 'text-destructive' : 'text-muted-foreground'
            )}>
              {expiryStatus.isExpired ? 'Expired' : `Expires: ${formatDate(link.expiresAt)}`}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewStats(link)}
              disabled={!canViewStats}
              className="gap-1"
            >
              {canViewStats ? (
                <BarChart3 className="h-3 w-3" />
              ) : (
                <Lock className="h-3 w-3" />
              )}
              Stats
            </Button>
          </div>

          {/* Custom slug badge */}
          {link.isCustomSlug && (
            <span className="inline-flex items-center self-start rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Custom Slug
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
