import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: { name: string; included: boolean }[];
  cta: string;
  ctaLink: string;
  popular?: boolean;
}

const tiers: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started',
    features: [
      { name: 'Anonymous links (6 months)', included: true },
      { name: 'Saved links', included: true },
      { name: 'Custom slugs', included: false },
      { name: 'Custom expiry', included: false },
      { name: 'Statistics', included: false },
      { name: 'API Access', included: false },
    ],
    cta: 'Get Started',
    ctaLink: '/register',
  },
  {
    name: 'Extended',
    price: '$9',
    description: 'For power users',
    features: [
      { name: 'Anonymous links', included: true },
      { name: 'Saved links', included: true },
      { name: 'Custom slugs', included: true },
      { name: 'Custom expiry (min-year)', included: true },
      { name: 'Statistics', included: false },
      { name: 'API Access', included: false },
    ],
    cta: 'Upgrade to Extended',
    ctaLink: '/register',
    popular: true,
  },
  {
    name: 'Ultimate',
    price: '$29',
    description: 'For professionals',
    features: [
      { name: 'Anonymous links', included: true },
      { name: 'Saved links', included: true },
      { name: 'Custom slugs', included: true },
      { name: 'Custom expiry', included: true },
      { name: 'Statistics', included: true },
      { name: 'API Access', included: false },
    ],
    cta: 'Upgrade to Ultimate',
    ctaLink: '/register',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations',
    features: [
      { name: 'Anonymous links', included: true },
      { name: 'Saved links', included: true },
      { name: 'Custom slugs', included: true },
      { name: 'Custom expiry', included: true },
      { name: 'Statistics', included: true },
      { name: 'API Access', included: true },
    ],
    cta: 'Contact Sales',
    ctaLink: '/enterprise',
  },
];

const Pricing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Choose the plan that fits your needs. Upgrade or downgrade at any time.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {tiers.map((tier) => (
                <Card
                  key={tier.name}
                  className={cn(
                    'relative flex flex-col',
                    tier.popular && 'border-primary shadow-lg'
                  )}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <CardHeader className="text-center">
                    <CardTitle className="text-xl">{tier.name}</CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{tier.price}</span>
                      {tier.price !== 'Custom' && (
                        <span className="text-muted-foreground">/month</span>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-3 mb-6 flex-1">
                      {tier.features.map((feature) => (
                        <li key={feature.name} className="flex items-center gap-2">
                          {feature.included ? (
                            <Check className="h-4 w-4 text-green-500 shrink-0" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                          <span
                            className={cn(
                              'text-sm',
                              !feature.included && 'text-muted-foreground'
                            )}
                          >
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={tier.popular ? 'default' : 'outline'}
                      className="w-full"
                      asChild
                    >
                      <Link to={tier.ctaLink}>
                        {tier.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-muted/50">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div>
                <h3 className="font-semibold mb-2">Can I upgrade at any time?</h3>
                <p className="text-muted-foreground text-sm">
                  Yes! You can upgrade your plan at any time. The new features will be available immediately.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What happens to my links if I downgrade?</h3>
                <p className="text-muted-foreground text-sm">
                  Your existing links will continue to work. You'll just lose access to premium features for new links.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Is there a free trial for paid plans?</h3>
                <p className="text-muted-foreground text-sm">
                  We offer a free tier that you can use indefinitely. Try it out and upgrade when you're ready.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
                <p className="text-muted-foreground text-sm">
                  Yes, we offer a 30-day money-back guarantee for all paid plans.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container px-4 md:px-6">
          <p className="text-center text-sm text-muted-foreground">
            © 2026 LinkShort. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
