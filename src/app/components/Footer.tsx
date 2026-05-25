import { Link } from 'react-router';
import { Facebook, Instagram, Youtube, Linkedin } from 'lucide-react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-16">
      <div className="container mx-auto max-w-screen-2xl px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Link to="/">
                <Logo className="w-45" />
              </Link>
            </div>
            <div className="mt-2 space-y-2 text-sm">
              <Link to="/regulamin" className="text-muted-foreground hover:text-primary">
                Regulamin
              </Link>
              <div>
                <Link to="/polityka-prywatnosci" className="text-muted-foreground hover:text-primary">
                  Polityka prywatności
                </Link>
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-primary hover:text-white rounded-lg transition-colors" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-primary hover:text-white rounded-lg transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-primary hover:text-white rounded-lg transition-colors" aria-label="YouTube">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-primary hover:text-white rounded-lg transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">Diety</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/diety" className="text-muted-foreground hover:text-primary">
                  Wszystkie diety
                </Link>
              </li>
              <li>
                <Link to="/diety/1" className="text-muted-foreground hover:text-primary">
                  Standard
                </Link>
              </li>
              <li>
                <Link to="/diety/2" className="text-muted-foreground hover:text-primary">
                  Fit
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Dostawa</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/dostawa#info" className="text-muted-foreground hover:text-primary">
                  Informacje o dostawie
                </Link>
              </li>
              <li>
                <Link to="/dostawa#koszty" className="text-muted-foreground hover:text-primary">
                  Koszty dostawy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Kontakt</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="tel:+48123456789" className="flex items-center gap-2 transition-colors hover:text-primary">
                  <Phone className="w-4 h-4" />
                  <span>+48 123 456 789</span>
                </a>
              </li>
              <li>
                <a href="mailto:kontakt@catering.pl" className="flex items-center gap-2 transition-colors hover:text-primary">
                  <Mail className="w-4 h-4" />
                  <span>kontakt@catering.pl</span>
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>ul. Przykładowa 123, Kraków</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
