import { Link } from 'react-router';
import { Compass } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';

export function NotFoundPage() {
  return (
    <div className="container mx-auto max-w-screen-2xl px-8 py-8">
      <Breadcrumbs items={[{ label: 'Strona główna', to: '/' }, { label: 'Nie znaleziono strony' }]} />

      <section className="mx-auto flex max-w-2xl flex-col items-center rounded-xl border border-border bg-white px-6 py-16 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Compass className="h-8 w-8 text-primary" />
        </div>
        <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">Błąd 404</p>
        <h1 className="mb-4 text-3xl font-bold">Nie znaleziono strony</h1>
        <p className="mb-8 max-w-lg text-muted-foreground">
          Podany adres nie prowadzi do dostępnego widoku. Wróć na stronę główną lub przejdź do oferty diet.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/" className="rounded-lg bg-primary px-6 py-3 text-white transition-colors hover:bg-primary/90">
            Strona główna
          </Link>
          <Link to="/diety" className="rounded-lg border border-border px-6 py-3 transition-colors hover:bg-secondary">
            Zobacz diety
          </Link>
        </div>
      </section>
    </div>
  );
}
