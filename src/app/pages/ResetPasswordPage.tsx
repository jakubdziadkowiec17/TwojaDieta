import { useState } from "react";
import { Link } from "react-router";
import { Breadcrumbs } from "../components/Breadcrumbs";

export function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // No backend – demo only.
    setSent(true);
  };

  return (
    <div className="container mx-auto max-w-screen-2xl px-8 py-8">
      <Breadcrumbs items={[{ label: "Strona główna", to: "/" }, { label: "Reset hasła" }]} />

      <div className="max-w-xl bg-white border border-border rounded-xl p-6">
        <h1 className="text-3xl font-bold mb-2">Przywracanie hasła</h1>
        <p className="text-muted-foreground mb-6">
          W projekcie bez backendu nie wysyłamy e-maili. Ten widok jest makietą funkcjonalną.
        </p>

        {sent ? (
          <div>
            <div className="bg-primary/10 text-primary border border-primary/20 rounded-lg p-4 mb-6">
              Jeśli konto istnieje, wysłalibyśmy link resetujący na: <span className="font-medium">{email || "(brak)"}</span>
            </div>
            <Link to="/logowanie" className="text-primary hover:underline">Wróć do logowania</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg"
                placeholder="np. klient@twojadieta.pl"
              />
            </div>
            <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90">Wyślij link</button>
          </form>
        )}
      </div>
    </div>
  );
}
