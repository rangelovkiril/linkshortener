import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import { statsApi } from '@/api/stats';
import { LinkStatistics, Statistic } from '@/types/statistics';
import { Navbar } from '@/components/Navbar';
import { Loader } from '@/components/Loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  MousePointerClick, 
  Globe, 
  Monitor, 
  Smartphone,
  AlertCircle,
  Lock,
  Crown
} from 'lucide-react';

const LinkStats = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState<LinkStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tier = user?.subscriptionTier;
  const canViewStats = tier === 'ultimate' || tier === 'enterprise';

  useEffect(() => {
    if (!id) return;

    if (!canViewStats) {
      setIsLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const data = await statsApi.getLinkStatistics(id);
        setStats(data);
      } catch {
        setError('Failed to load statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [id, canViewStats]);

  const groupStatsByType = (statistics: Statistic[]) => {
    return statistics.reduce((acc, stat) => {
      if (!acc[stat.type]) {
        acc[stat.type] = [];
      }
      acc[stat.type].push(stat);
      return acc;
    }, {} as Record<string, Statistic[]>);
  };

  const getStatCount = (type: string, statistics: Statistic[]) => {
    return statistics.filter(s => s.type === type).length;
  };

  if (!canViewStats) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/30">
        <Navbar />
        <main className="flex-1 container py-8">
          <Button variant="ghost" onClick={() => navigate('/links')} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Links
          </Button>

          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Statistics Unavailable</h1>
            <p className="text-muted-foreground max-w-md mb-8">
              Link statistics are available with Ultimate tier or higher. 
              Upgrade your plan to access detailed analytics for your links.
            </p>
            <Button asChild>
              <Link to="/pricing">
                <Crown className="mr-2 h-4 w-4" />
                Upgrade to Ultimate
              </Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/30">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader size="lg" />
        </main>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/30">
        <Navbar />
        <main className="flex-1 container py-8">
          <Button variant="ghost" onClick={() => navigate('/links')} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Links
          </Button>

          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Failed to load statistics</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </main>
      </div>
    );
  }

  const groupedStats = groupStatsByType(stats.statistics);

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />

      <main className="flex-1 container py-8">
        <Button variant="ghost" onClick={() => navigate('/links')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Links
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Link Statistics</h1>
          <p className="text-muted-foreground">
            Detailed analytics for your shortened link
          </p>
        </div>

        {/* Total Clicks */}
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <CardDescription>Total Clicks</CardDescription>
            <CardTitle className="text-5xl flex items-center gap-3">
              <MousePointerClick className="h-10 w-10 text-primary" />
              {stats.totalClicks}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Stats Breakdown */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Referrers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5" />
                Referrers
              </CardTitle>
              <CardDescription>
                {getStatCount('referrer', stats.statistics)} tracked
              </CardDescription>
            </CardHeader>
            <CardContent>
              {groupedStats.referrer?.length ? (
                <ul className="space-y-2">
                  {groupedStats.referrer.slice(0, 5).map((stat) => (
                    <li key={stat.id} className="text-sm text-muted-foreground truncate">
                      {(stat.data.referrer as string) || 'Direct'}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No referrer data yet</p>
              )}
            </CardContent>
          </Card>

          {/* Browsers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Monitor className="h-5 w-5" />
                Browsers
              </CardTitle>
              <CardDescription>
                {getStatCount('browser', stats.statistics)} tracked
              </CardDescription>
            </CardHeader>
            <CardContent>
              {groupedStats.browser?.length ? (
                <ul className="space-y-2">
                  {groupedStats.browser.slice(0, 5).map((stat) => (
                    <li key={stat.id} className="text-sm text-muted-foreground truncate">
                      {(stat.data.userAgent as string)?.split(' ')[0] || 'Unknown'}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No browser data yet</p>
              )}
            </CardContent>
          </Card>

          {/* Devices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Smartphone className="h-5 w-5" />
                Devices
              </CardTitle>
              <CardDescription>
                {getStatCount('device', stats.statistics)} tracked
              </CardDescription>
            </CardHeader>
            <CardContent>
              {groupedStats.device?.length ? (
                <ul className="space-y-2">
                  {groupedStats.device.slice(0, 5).map((stat) => (
                    <li key={stat.id} className="text-sm text-muted-foreground">
                      {(stat.data.device as string) || 'Unknown'}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No device data yet</p>
              )}
            </CardContent>
          </Card>

          {/* Countries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5" />
                Countries
              </CardTitle>
              <CardDescription>
                {getStatCount('country', stats.statistics)} tracked
              </CardDescription>
            </CardHeader>
            <CardContent>
              {groupedStats.country?.length ? (
                <ul className="space-y-2">
                  {groupedStats.country.slice(0, 5).map((stat) => (
                    <li key={stat.id} className="text-sm text-muted-foreground">
                      {(stat.data.country as string) || 'Unknown'}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No country data yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default LinkStats;
