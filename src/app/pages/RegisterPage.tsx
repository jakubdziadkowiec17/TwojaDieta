import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useAuth } from '../providers/AuthProvider';

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!acceptTerms) {
      setError('Zaakceptuj regulamin i politykę prywatności.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Hasła nie są takie same.');
      return;
    }
    const res = register({ firstName, lastName, email, password });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    navigate('/konto', { replace: true });
  };

  return (
    <div className="container mx-auto max-w-screen-2xl px-8 py-8">
      <Breadcrumbs items={[{ label: 'Strona główna', to: '/' }, { label: 'Rejestracja' }]} />

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary-light/20 rounded-xl p-12">
          <div className="text-center">
            <div className="w-32 h-32 bg-white/50 rounded-xl mx-auto mb-6 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&h=300&fit=crop"
                alt="Register"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <h3 className="text-xl font-bold mb-2">Dołącz do nas!</h3>
            <p className="text-muted-foreground">Załóż konto i ciesz się pełnią możliwości</p>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-2">ZAREJESTRUJ SIĘ</h2>
          <p className="text-muted-foreground mb-8">Załóż konto i ciesz się pełnią możliwości</p>

          <form className="space-y-4" onSubmit={onSubmit}>
            {error && (
              <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Imię
              </label>
              <input
                type="text"
                id="name"
                placeholder="Wpisz swoje imię"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="surname" className="block text-sm font-medium mb-2">
                Nazwisko
              </label>
              <input
                type="text"
                id="surname"
                placeholder="Wpisz swoje nazwisko"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

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
                  placeholder="Wpisz hasło"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg pr-12 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-secondary rounded"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Powtórz hasło
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  placeholder="Powtórz hasło"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg pr-12 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-secondary rounded"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="w-4 h-4 mt-1 rounded border-border"
              />
              <span className="text-sm">
                Akceptuję{' '}
                <Link to="/regulamin" className="text-primary hover:underline">
                  regulamin
                </Link>{' '}
                i{' '}
                <Link to="/polityka-prywatnosci" className="text-primary hover:underline">
                  politykę prywatności
                </Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={!acceptTerms}
              className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              ZAREJESTRUJ SIĘ
            </button>

            <p className="text-center text-sm">
              Masz już konto?{' '}
              <Link to="/logowanie" className="text-primary hover:underline font-medium">
                Zaloguj się
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
