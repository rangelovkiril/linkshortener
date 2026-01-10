import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLinks } from '@/store/LinkContext';
import { Link as LinkType } from '@/types/link';
import { Navbar } from '@/components/Navbar';
import { LinkCard } from '@/components/LinkCard';
import { CreateLinkModal } from '@/components/CreateLinkModal';
import { EditLinkModal } from '@/components/EditLinkModal';
import { DeleteLinkDialog } from '@/components/DeleteLinkDialog';
import { Loader } from '@/components/Loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, LinkIcon, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/store/AuthContext';

const MyLinks = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { links, isLoading, error, fetchLinks, deleteLink } = useLinks();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);
  const [deletingLink, setDeletingLink] = useState<LinkType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const filteredLinks = links.filter((link) => {
    const query = searchQuery.toLowerCase();
    return (
      link.shortCode.toLowerCase().includes(query) ||
      link.originalUrl.toLowerCase().includes(query) ||
      link.label?.toLowerCase().includes(query)
    );
  });

  const handleEdit = (link: LinkType) => {
    setEditingLink(link);
  };

  const handleDelete = (link: LinkType) => {
    setDeletingLink(link);
  };

  const handleViewStats = (link: LinkType) => {
    const tier = user?.subscriptionTier;
    if (tier === 'ultimate' || tier === 'enterprise') {
      navigate(`/links/${link.id}/stats`);
    } else {
      toast({
        title: 'Upgrade Required',
        description: 'Statistics are available with Ultimate tier or higher.',
        variant: 'destructive',
      });
    }
  };

  const confirmDelete = async () => {
    if (!deletingLink) return;

    setIsDeleting(true);
    try {
      await deleteLink(deletingLink.id);
      toast({
        title: 'Link deleted',
        description: 'The link has been permanently removed.',
      });
      setDeletingLink(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete link';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />

      <main className="flex-1 container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Links</h1>
            <p className="text-muted-foreground">
              Manage your shortened URLs
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Link
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search links..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader size="lg" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Failed to load links</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchLinks}>Try Again</Button>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <LinkIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {searchQuery ? 'No links found' : 'No links yet'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? 'Try a different search term'
                : 'Create your first shortened link to get started'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Link
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredLinks.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewStats={handleViewStats}
              />
            ))}
          </div>
        )}
      </main>

      <CreateLinkModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
      <EditLinkModal link={editingLink} open={!!editingLink} onOpenChange={(open) => !open && setEditingLink(null)} />
      <DeleteLinkDialog
        link={deletingLink}
        open={!!deletingLink}
        onOpenChange={(open) => !open && setDeletingLink(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default MyLinks;
