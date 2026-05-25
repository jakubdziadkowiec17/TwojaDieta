import { Link, useLocation } from 'react-router';
import { ShoppingCart, User, Menu } from 'lucide-react';
import { useState } from 'react';
import { Logo } from './Logo';
import { useAuth } from '../providers/AuthProvider';
import { useCart } from '../providers/CartProvider';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { items } = useCart();

  const navLinks = [
    { to: '/diety', label: 'Diety' },
    { to: '/dostawa', label: 'Dostawa' },
  ];

  const accountLabel = isAuthenticated
    ? `Konto (${user!.profile.firstName})`
    : 'Zaloguj się';

  const accountTo = isAuthenticated ? '/konto' : '/logowanie';

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50">
      <div className="container mx-auto max-w-screen-2xl px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="w-45" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`hover:text-primary transition-colors ${
                  isActive(link.to) ? 'text-primary font-medium' : 'text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {isAdmin && (
              <Link
                to="/admin"
                className={`hover:text-primary transition-colors ${
                  isActive('/admin') ? 'text-primary font-medium' : 'text-foreground'
                }`}
              >
                Panel administratora
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/koszyk"
              className="hidden md:block p-2 hover:text-primary hover:bg-secondary rounded-lg transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
            <Link
              to={accountTo}
              className="hidden md:flex items-center gap-2 px-4 py-2 hover:text-primary hover:bg-secondary rounded-lg transition-colors"
            >
              <User className="w-5 h-5" />
              <span>{accountLabel}</span>
            </Link>
            {isAuthenticated && (
              <button
                type="button"
                onClick={logout}
                className="hidden md:flex items-center px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                Wyloguj
              </button>
            )}
            <button
              className="md:hidden p-2 hover:bg-secondary rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block py-2 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="block py-2 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Panel administratora
              </Link>
            )}
            {/* Koszyk tylko jako tekst na mobile */}
            <Link
              to={accountTo}
              className="block py-2 hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Konto
            </Link>
            <Link
              to="/koszyk"
              className="block py-2 hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Koszyk {items.length > 0 ? `(${items.length})` : ''}
            </Link>
            {isAuthenticated && (
              <button
                type="button"
                className="block py-2 hover:text-primary text-left w-full"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
              >
                Wyloguj
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
