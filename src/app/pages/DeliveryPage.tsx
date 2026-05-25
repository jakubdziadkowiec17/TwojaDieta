import { Breadcrumbs } from '../components/Breadcrumbs';
import { Truck, Clock, MapPin, Shield } from 'lucide-react';
import { useEffect } from 'react';
import { useLocation } from 'react-router';

export function DeliveryPage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.replace('#', ''));
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 0);
      }
    }
  }, [location.hash]);

  return (
    <div className="container mx-auto max-w-screen-2xl px-8 py-8">
      <Breadcrumbs items={[{ label: 'Strona główna', to: '/' }, { label: 'Dostawa' }]} />

      <h1 id="info" className="text-4xl font-bold mb-6">Informacje o dostawie</h1>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white border border-border rounded-xl p-8">
          <Truck className="w-12 h-12 text-primary mb-4" />
          <h2 className="text-2xl font-bold mb-4">Dostawa codziennie</h2>
          <p className="text-muted-foreground mb-4">
            Twoje posiłki są dostarczane codziennie rano, świeże i gotowe do spożycia.
            Dostarczamy w godzinach 6:00 - 10:00, dzięki czemu Twoje śniadanie jest zawsze na czas.
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-sm text-primary flex-shrink-0 mt-0.5">
                ✓
              </span>
              <span>Dostawa 7 dni w tygodniu</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-sm text-primary flex-shrink-0 mt-0.5">
                ✓
              </span>
              <span>Termoizolowane opakowania</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-sm text-primary flex-shrink-0 mt-0.5">
                ✓
              </span>
              <span>Świeże posiłki każdego dnia</span>
            </li>
          </ul>
        </div>

        <div className="bg-white border border-border rounded-xl p-8">
          <Clock className="w-12 h-12 text-primary mb-4" />
          <h2 className="text-2xl font-bold mb-4">Godziny dostawy</h2>
          <p className="text-muted-foreground mb-4">
            Dostawy realizujemy w porannych przedziałach czasowych, aby posiłki dotarły świeże.
            Informujemy SMS-em o zbliżającej się dostawie.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
              <span className="font-medium">Dostawa poranna</span>
              <span className="text-muted-foreground">6:00 - 10:00</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
              <span className="font-medium">Dostawa przedpołudniowa</span>
              <span className="text-muted-foreground">10:00 - 14:00</span>
            </div>
          </div>
        </div>
      </div>

      <div id="koszty" className="bg-gradient-to-br from-primary/5 to-primary-light/10 rounded-xl p-8 mb-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Darmowa dostawa!</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Przy zamówieniu powyżej 250 zł nie płacisz za dostawę. W innym przypadku koszt dostawy to tylko 15 zł.
          </p>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-6 text-left">
              <div className="text-3xl font-bold text-primary mb-2">0 zł</div>
              <div className="text-sm text-muted-foreground">Dostawa powyżej 250 zł</div>
            </div>
            <div className="bg-white rounded-xl p-6 text-left">
              <div className="text-3xl font-bold text-primary mb-2">15 zł</div>
              <div className="text-sm text-muted-foreground">Dostawa poniżej 250 zł</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white border border-border rounded-xl p-6">
          <MapPin className="w-12 h-12 text-primary mb-4" />
          <h3 className="font-bold mb-2">Obszar dostawy</h3>
          <p className="text-sm text-muted-foreground">
            Dostarczamy na terenie Krakowa. Adres dostawy podasz podczas składania zamówienia.
          </p>
        </div>

        <div className="bg-white border border-border rounded-xl p-6">
          <Shield className="w-12 h-12 text-primary mb-4" />
          <h3 className="font-bold mb-2">Bezpieczna dostawa</h3>
          <p className="text-sm text-muted-foreground">
            Przestrzegamy najwyższych standardów higieny i bezpieczeństwa żywności. Każdy posiłek jest szczelnie zapakowany.
          </p>
        </div>

        <div className="bg-white border border-border rounded-xl p-6">
          <Truck className="w-12 h-12 text-primary mb-4" />
          <h3 className="font-bold mb-2">Śledzenie dostawy</h3>
          <p className="text-sm text-muted-foreground">
            Po złożeniu zamówienia otrzymasz link do śledzenia dostawy w czasie rzeczywistym i powiadomienia SMS.
          </p>
        </div>
      </div>
    </div>
  );
}
