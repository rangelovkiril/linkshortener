import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import { useLinks } from '@/store/LinkContext';
import { Navbar } from '@/components/Navbar';
import { SubscriptionBadge } from '@/components/SubscriptionBadge';
import { CreateLinkModal } from '@/components/CreateLinkModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, LinkIcon, ArrowRight, Crown } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { links } = useLinks();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const tier = user?.subscriptionTier || 'free';
  const isFreeTier = tier === 'free';

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />

      <main className="flex-1 container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.email}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {user && <SubscriptionBadge tier={user.subscriptionTier} />}
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Link
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Links</CardDescription>
              <CardTitle className="text-4xl">{links.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link to="/links" className="text-sm text-primary hover:underline inline-flex items-center">
                View all links
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Current Plan</CardDescription>
              <CardTitle className="text-4xl capitalize">{tier}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link to="/pricing" className="text-sm text-primary hover:underline inline-flex items-center">
                {isFreeTier ? 'Upgrade plan' : 'View plans'}
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Features Available</CardDescription>
              <CardTitle className="text-4xl">
                {tier === 'free' ? '2' : tier === 'extended' ? '4' : '6'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-sm text-muted-foreground">
                {isFreeTier ? 'Basic features only' : 'Premium features enabled'}
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Quick Links
              </CardTitle>
              <CardDescription>Manage your shortened URLs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Link
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/links">
                  View All Links
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {isFreeTier && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  Upgrade Your Plan
                </CardTitle>
                <CardDescription>
                  Get access to more features with a premium plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Custom slugs for memorable URLs
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Custom expiry dates
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Detailed analytics & statistics
                  </li>
                </ul>
                <Button asChild className="w-full">
                  <Link to="/pricing">
                    View Pricing
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {!isFreeTier && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Premium Features
                </CardTitle>
                <CardDescription>You have access to these features</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Custom slugs
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Custom expiry dates
                  </li>
                  {(tier === 'ultimate' || tier === 'enterprise') && (
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Detailed analytics
                    </li>
                  )}
                  {tier === 'enterprise' && (
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      API Access
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <CreateLinkModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
    </div>
  );
};

export default Dashboard;
