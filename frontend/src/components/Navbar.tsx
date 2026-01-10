import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import { Button } from '@/components/ui/button';
import { SubscriptionBadge } from './SubscriptionBadge';
import { Link2, Menu, X, LayoutDashboard, LinkIcon, CreditCard, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl" onClick={closeMenu}>
          <Link2 className="h-6 w-6 text-primary" />
          <span>LinkShort</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link to="/links" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                My Links
              </Link>
              <div className="flex items-center gap-4">
                {user && <SubscriptionBadge tier={user.subscriptionTier} />}
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300 ease-in-out',
          isMenuOpen ? 'max-h-96' : 'max-h-0'
        )}
      >
        <div className="container py-4 space-y-3 border-t">
          <Link
            to="/pricing"
            className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors"
            onClick={closeMenu}
          >
            <CreditCard className="h-4 w-4" />
            Pricing
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors"
                onClick={closeMenu}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                to="/links"
                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors"
                onClick={closeMenu}
              >
                <LinkIcon className="h-4 w-4" />
                My Links
              </Link>
              <div className="flex items-center justify-between p-2">
                {user && <SubscriptionBadge tier={user.subscriptionTier} />}
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 p-2">
              <Button variant="outline" asChild className="w-full">
                <Link to="/login" onClick={closeMenu}>Sign In</Link>
              </Button>
              <Button asChild className="w-full">
                <Link to="/register" onClick={closeMenu}>Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
