import { useState } from "react";
import { Link } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { useAuth } from "../providers/AuthProvider";
import { toast } from "sonner";

export function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("Hasła nie są takie same.");
      return;
    }

    const result = resetPassword({ email, newPassword });
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSuccess(true);
    toast.success("Hasło zostało zmienione.");
  };

  return (
    <div className="container mx-auto max-w-screen-2xl px-8 py-8">
      <Breadcrumbs items={[{ label: "Strona główna", to: "/" }, { label: "Reset hasła" }]} />

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary-light/20 rounded-xl p-12">
          <div className="text-center">
            <div className="w-32 h-32 bg-white/50 rounded-xl mx-auto mb-6 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=300&h=300&fit=crop"
                alt="Przywracanie hasła"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <h3 className="text-xl font-bold mb-2">Odzyskaj dostęp</h3>
            <p className="text-muted-foreground">Wróć do swoich diet i zamówień w kilku krokach</p>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-2">PRZYWRACANIE HASŁA</h1>
          <p className="text-muted-foreground mb-8">
            Podaj adres e-mail użyty podczas rejestracji, aby odzyskać dostęp do konta.
          </p>

          {success ? (
            <div>
              <div className="bg-primary/10 text-primary border border-primary/20 rounded-lg p-4 mb-6">
                Hasło dla konta <span className="font-medium">{email}</span> zostało zmienione. Możesz zalogować się nowym hasłem.
              </div>
              <Link
                to="/logowanie"
                className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                WRÓĆ DO LOGOWANIA
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium mb-2">Adres e-mail</label>
                <input
                  type="email"
                  id="reset-email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Wpisz swój adres e-mail"
                />
              </div>
              <div>
                <label htmlFor="reset-new-password" className="block text-sm font-medium mb-2">Nowe hasło</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="reset-new-password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg pr-12 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Wpisz nowe hasło"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-secondary rounded"
                    aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5 text-muted-foreground" /> : <Eye className="w-5 h-5 text-muted-foreground" />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="reset-confirm-password" className="block text-sm font-medium mb-2">Powtórz nowe hasło</label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="reset-confirm-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Powtórz nowe hasło"
                />
              </div>
              <button className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                USTAW NOWE HASŁO
              </button>
              <p className="text-center text-sm">
                Pamiętasz hasło?{' '}
                <Link to="/logowanie" className="text-primary hover:underline font-medium">
                  Zaloguj się
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
