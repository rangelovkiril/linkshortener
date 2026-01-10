import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { Loader } from '@/components/Loader';
import { linksApi } from '@/api/links';
import { validateUrl } from '@/utils/validation';
import { 
  Link2, 
  Copy, 
  Check, 
  ArrowRight, 
  Zap, 
  Shield, 
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Landing = () => {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShortUrl('');

    const urlError = validateUrl(url);
    if (urlError) {
      setError(urlError);
      return;
    }

    setIsLoading(true);

    try {
      const link = await linksApi.createAnonymous({ originalUrl: url });
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      setShortUrl(`${baseUrl.replace('/api', '')}/api/links/${link.shortCode}`);
      toast({
        title: 'Link shortened!',
        description: 'Your anonymous link is ready. It expires in 6 months.',
      });
    } catch {
      setError('Failed to shorten URL. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  Shorten Links.
                  <br />
                  <span className="text-primary">Amplify Reach.</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Create short, memorable links in seconds. Track clicks, customize URLs, 
                  and manage your links with our powerful SaaS platform.
                </p>
              </div>

              {/* URL Shortener Form */}
              <Card className="w-full max-w-2xl">
                <CardContent className="p-6">
                  <form onSubmit={handleShorten} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1">
                        <Input
                          type="url"
                          placeholder="Paste your long URL here..."
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          className="h-12"
                          disabled={isLoading}
                        />
                      </div>
                      <Button type="submit" size="lg" className="h-12" disabled={isLoading}>
                        {isLoading ? (
                          <Loader size="sm" className="mr-2" />
                        ) : (
                          <Link2 className="mr-2 h-4 w-4" />
                        )}
                        Shorten
                      </Button>
                    </div>

                    {error && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                      </p>
                    )}

                    {shortUrl && (
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <code className="flex-1 text-sm font-mono truncate">{shortUrl}</code>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleCopy}
                        >
                          {copied ? (
                            <>
                              <Check className="h-4 w-4 mr-1 text-green-500" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground text-center">
                      Anonymous links expire in 6 months.{' '}
                      <Link to="/register" className="text-primary hover:underline">
                        Sign up
                      </Link>{' '}
                      for more features!
                    </p>
                  </form>
                </CardContent>
              </Card>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link to="/register">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/pricing">View Pricing</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/50">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose LinkShort?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
                  <p className="text-muted-foreground">
                    Create short links instantly. No delays, no waiting. Your links are ready in milliseconds.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                    <Shield className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
                  <p className="text-muted-foreground">
                    Your links are protected with enterprise-grade security. 99.9% uptime guaranteed.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Powerful Analytics</h3>
                  <p className="text-muted-foreground">
                    Track clicks, referrers, browsers, and more. Get insights that matter for your business.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              <span className="font-semibold">LinkShort</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 LinkShort. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
