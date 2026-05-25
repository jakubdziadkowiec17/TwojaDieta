import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useAuth } from '../providers/AuthProvider';

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, users } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const redirect = searchParams.get('redirect');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    const willBeAdmin = users.find((u) => u.email === normalizedEmail)?.role === 'admin';

    const res = login({ email, password, rememberMe });
    if (!res.ok) {
      setError(res.error);
      return;
    }

    if (redirect) {
      navigate(decodeURIComponent(redirect), { replace: true });
      return;
    }
    navigate(willBeAdmin ? '/admin' : '/konto', { replace: true });
  };

  return (
    <div className="container mx-auto max-w-screen-2xl px-8 py-8">
      <Breadcrumbs items={[{ label: 'Strona główna', to: '/' }, { label: 'Logowanie' }]} />

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary-light/20 rounded-xl p-12">
          <div className="text-center">
            <div className="w-32 h-32 bg-white/50 rounded-xl mx-auto mb-6 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop"
                alt="Login"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <h3 className="text-xl font-bold mb-2">Witamy z powrotem!</h3>
            <p className="text-muted-foreground">Zaloguj się, aby zarządzać swoimi zamówieniami</p>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-2">ZALOGUJ SIĘ</h2>
          <p className="text-muted-foreground mb-8">Witaj ponownie! Zaloguj się, aby kontynuować.</p>

          <form className="space-y-4" onSubmit={onSubmit}>
            {error && (
              <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Adres e-mail
              </label>
              <input
                type="email"
                id="email"
                placeholder="Wpisz swój adres e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Hasło
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Wpisz swoje hasło"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg pr-12 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-secondary rounded"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Eye className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm">Zapamiętaj mnie</span>
              </label>
              <Link to="/reset-hasla" className="text-sm text-primary hover:underline">
                Nie pamiętasz hasła?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              ZALOGUJ SIĘ
            </button>

            <div className="text-xs text-muted-foreground">
              Demo: admin `admin@twojadieta.pl` / `admin` oraz klient `klient@twojadieta.pl` / `klient`.
            </div>

            <p className="text-center text-sm">
              Nie masz jeszcze konta?{' '}
              <Link to="/rejestracja" className="text-primary hover:underline font-medium">
                Zarejestruj się
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
