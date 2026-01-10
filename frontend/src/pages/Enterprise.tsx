import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Users, Shield, Headphones, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';

const Enterprise = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <Button variant="secondary" size="sm" asChild className="mb-8">
              <Link to="/pricing">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Pricing
              </Link>
            </Button>

            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Enterprise Solutions for Large Organizations
              </h1>
              <p className="text-xl opacity-90 mb-8">
                Get dedicated support, custom integrations, and unlimited access 
                to all features. Tailored to your organization's needs.
              </p>
              <Button size="lg" variant="secondary">
                Contact Our Sales Team
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Enterprise Features</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">API Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Full programmatic access to create, manage, and track links via our REST API.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Team Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Add unlimited team members with role-based access controls.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                    <Shield className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">SSO & Security</h3>
                  <p className="text-sm text-muted-foreground">
                    Enterprise-grade security with Single Sign-On support and audit logs.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                    <Headphones className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Priority Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Dedicated account manager and 24/7 priority support.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
              <p className="text-muted-foreground mb-8">
                Ready to discuss enterprise solutions? Our team is here to help you 
                find the perfect plan for your organization.
              </p>

              <div className="grid sm:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Mail className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">enterprise@linkshort.com</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Phone className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <MapPin className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">San Francisco, CA</p>
                  </CardContent>
                </Card>
              </div>

              <Button size="lg">
                <Mail className="mr-2 h-4 w-4" />
                Contact Sales
              </Button>
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

export default Enterprise;
