import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Home, ShoppingBag, Heart, MapPin, Settings, LogOut, Eye } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { useData } from '../providers/DataProvider';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

function formatDateTime(iso: string): string {
  try {
    return format(new Date(iso), 'dd.MM.yyyy HH:mm', { locale: pl });
  } catch {
    return iso;
  }
}

export function AccountPage() {
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const { orders, diets, reviews, upsertReview } = useData();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = searchParams.get('tab') ?? 'dashboard';
  const [activeTab, setActiveTab] = useState(initialTab);

  const myOrders = useMemo(() => {
    if (!user) return [];
    return orders.filter((o) => o.userId === user.id);
  }, [orders, user]);

  const myDietIds = useMemo(() => {
    const ids = new Set<string>();
    for (const o of myOrders) for (const it of o.items) ids.add(it.dietId);
    return Array.from(ids);
  }, [myOrders]);

  const initials = user
    ? `${user.profile.firstName?.[0] ?? ''}${user.profile.lastName?.[0] ?? ''}`.toUpperCase()
    : 'U';

  const [profileForm, setProfileForm] = useState(() => ({
    firstName: user?.profile.firstName ?? '',
    lastName: user?.profile.lastName ?? '',
    phone: user?.profile.phone ?? '',
    addressLine1: user?.profile.addressLine1 ?? '',
    addressCity: user?.profile.addressCity ?? 'Kraków',
    addressPostalCode: user?.profile.addressPostalCode ?? '',
  }));

  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  const menuItems = [
    { id: 'dashboard', label: 'Pulpit', icon: Home },
    { id: 'orders', label: 'Moje zamówienia', icon: ShoppingBag },
    { id: 'reviews', label: 'Ocena diet', icon: Heart },
    { id: 'addresses', label: 'Dane dostawy', icon: MapPin },
    { id: 'settings', label: 'Dane konta', icon: Settings },
  ];

  const onTabChange = (tab: string) => {
    setActiveTab(tab);
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    setSearchParams(next, { replace: true });
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto max-w-screen-2xl px-8 py-8">
        <Breadcrumbs items={[{ label: 'Strona główna', to: '/' }, { label: 'Konto' }]} />
        <div className="bg-white border border-border rounded-xl p-8 max-w-3xl">
          <h1 className="text-3xl font-bold mb-2">Konto klienta</h1>
          <p className="text-muted-foreground mb-6">
            Zaloguj się lub zarejestruj, aby mieć historię zamówień, dane dostawy i możliwość oceniania diet.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/logowanie" className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              Zaloguj się
            </Link>
            <Link to="/rejestracja" className="px-6 py-3 border border-border rounded-lg hover:bg-secondary transition-colors">
              Zarejestruj się
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-screen-2xl px-8 py-8">
      <Breadcrumbs items={[{ label: 'Strona główna', to: '/' }, { label: 'Konto' }]} />

      <div className="grid lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="bg-white border border-border rounded-xl p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-primary">{initials}</span>
              </div>
              <h3 className="font-bold">WITAJ, {user.profile.firstName.toUpperCase()} {user.profile.lastName.toUpperCase()}!</h3>
              <p className="text-sm text-muted-foreground">Poniżej znajdziesz podsumowanie swojego konta.</p>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-primary text-white'
                      : 'hover:bg-secondary text-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary text-foreground border-t border-border mt-4 pt-4"
              >
                <LogOut className="w-5 h-5" />
                <span>Wyloguj się</span>
              </button>
            </nav>
          </div>
        </aside>

        <main className="lg:col-span-3">
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Pulpit</h2>

              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <div className="bg-white border border-border rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold">{myOrders.length}</div>
                      <div className="text-sm text-muted-foreground">Zamówienia</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-border rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                      <Heart className="w-8 h-8 text-accent" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold">{myDietIds.length}</div>
                      <div className="text-sm text-muted-foreground">Diety w historii</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-border rounded-xl p-6">
                <h3 className="font-bold mb-4">OSTATNIE ZAMÓWIENIA</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Numer zamówienia</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Data</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Kwota</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Akcje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myOrders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="border-b border-border last:border-b-0">
                          <td className="px-4 py-3">#{order.id}</td>
                          <td className="px-4 py-3">{formatDateTime(order.createdAt)}</td>
                          <td className="px-4 py-3 font-medium">{order.total} zł</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs ${
                                order.status === 'Dostarczone'
                                  ? 'bg-primary/10 text-primary'
                                  : order.status === 'W trakcie' || order.status === 'Nowe'
                                  ? 'bg-accent/10 text-accent'
                                  : 'bg-destructive/10 text-destructive'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button type="button" className="p-2 hover:bg-secondary rounded-lg" onClick={() => onTabChange('orders')}>
                              <Eye className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {myOrders.length === 0 && (
                        <tr>
                          <td className="px-4 py-6 text-muted-foreground" colSpan={5}>Brak zamówień. <Link to="/diety" className="text-primary hover:underline">Zobacz ofertę</Link>.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Moje zamówienia</h2>
              <div className="bg-white border border-border rounded-xl p-6">
                {myOrders.length === 0 ? (
                  <p className="text-muted-foreground">Nie masz jeszcze zamówień.</p>
                ) : (
                  <div className="space-y-4">
                    {myOrders.map((order) => (
                      <div key={order.id} className="border border-border rounded-xl p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <div className="font-bold">Zamówienie #{order.id}</div>
                            <div className="text-sm text-muted-foreground">{formatDateTime(order.createdAt)}</div>
                          </div>
                          <div className="font-bold text-primary">{order.total} zł</div>
                        </div>

                        <div className="text-sm text-muted-foreground mt-2">Status: {order.status}</div>
                        <div className="mt-3 space-y-1 text-sm">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>{it.dietName} • {it.calories} kcal • {it.days} dni</span>
                              <span className="font-medium">{it.pricePerDay * it.days} zł</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Ocena diet</h2>
              <div className="bg-white border border-border rounded-xl p-6">
                {myDietIds.length === 0 ? (
                  <p className="text-muted-foreground">Najpierw złóż zamówienie, aby móc oceniać diety.</p>
                ) : (
                  <div className="space-y-6">
                    {myDietIds.map((dietId) => {
                      const diet = diets.find((d) => d.id === dietId);
                      if (!diet) return null;
                      const existing = reviews.find((r) => r.dietId === dietId && r.userId === user.id) ?? null;
                      return (
                        <div key={dietId} className="border border-border rounded-xl p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <div className="font-bold">{diet.name}</div>
                              <div className="text-sm text-muted-foreground">{diet.shortDescription}</div>
                            </div>
                            {existing && (
                              <div className="text-sm text-muted-foreground">Twoja ocena: {existing.rating}/5</div>
                            )}
                          </div>

                          <ReviewForm
                            key={existing?.id ?? dietId}
                            initialRating={existing?.rating ?? 5}
                            initialComment={existing?.comment ?? ''}
                            onSave={(rating, comment) => {
                              upsertReview({
                                dietId,
                                userId: user.id,
                                authorName: `${user.profile.firstName} ${user.profile.lastName}`,
                                rating,
                                comment,
                              });
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Dane dostawy</h2>
              <div className="bg-white border border-border rounded-xl p-6">
                <p className="text-muted-foreground mb-4">
                  Te dane zostaną podpowiedziane w koszyku przy kolejnych zamówieniach.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-2">Adres</label>
                    <input
                      value={profileForm.addressLine1}
                      onChange={(e) => setProfileForm((p) => ({ ...p, addressLine1: e.target.value }))}
                      className="w-full px-4 py-2 border border-border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Miasto</label>
                    <input
                      value={profileForm.addressCity}
                      onChange={(e) => setProfileForm((p) => ({ ...p, addressCity: e.target.value }))}
                      className="w-full px-4 py-2 border border-border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Kod pocztowy</label>
                    <input
                      value={profileForm.addressPostalCode}
                      onChange={(e) => setProfileForm((p) => ({ ...p, addressPostalCode: e.target.value }))}
                      className="w-full px-4 py-2 border border-border rounded-lg"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const res = updateProfile({
                      addressLine1: profileForm.addressLine1,
                      addressCity: profileForm.addressCity,
                      addressPostalCode: profileForm.addressPostalCode,
                    });
                    setProfileMsg(res.ok ? 'Zapisano.' : res.error);
                    window.setTimeout(() => setProfileMsg(null), 2000);
                  }}
                  className="mt-4 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Zapisz
                </button>
                {profileMsg && <div className="text-sm text-muted-foreground mt-3">{profileMsg}</div>}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Dane konta</h2>
              <div className="bg-white border border-border rounded-xl p-6">
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const res = updateProfile({
                      firstName: profileForm.firstName,
                      lastName: profileForm.lastName,
                      phone: profileForm.phone,
                    });
                    setProfileMsg(res.ok ? 'Zapisano.' : res.error);
                    window.setTimeout(() => setProfileMsg(null), 2000);
                  }}
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Imię</label>
                      <input
                        type="text"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm((p) => ({ ...p, firstName: e.target.value }))}
                        className="w-full px-4 py-2 border border-border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Nazwisko</label>
                      <input
                        type="text"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm((p) => ({ ...p, lastName: e.target.value }))}
                        className="w-full px-4 py-2 border border-border rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={user.email}
                      readOnly
                      className="w-full px-4 py-2 border border-border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Telefon</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                      className="w-full px-4 py-2 border border-border rounded-lg"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    Zapisz zmiany
                  </button>
                  {profileMsg && <div className="text-sm text-muted-foreground">{profileMsg}</div>}
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function ReviewForm({
  initialRating,
  initialComment,
  onSave,
}: {
  initialRating: number;
  initialComment: string;
  onSave: (rating: number, comment: string) => void;
}) {
  const [rating, setRating] = useState<number>(initialRating);
  const [comment, setComment] = useState<string>(initialComment);
  const [saved, setSaved] = useState(false);

  return (
    <div className="mt-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Ocena (1-5)</label>
          <select
            value={rating}
            onChange={(e) => setRating(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-border rounded-lg"
          >
            {[5, 4, 3, 2, 1].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-2">Komentarz</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg min-h-[90px]"
            placeholder="Co Ci się podobało?"
          />
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          onSave(rating, comment);
          setSaved(true);
          window.setTimeout(() => setSaved(false), 1500);
        }}
        className="mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
      >
        Zapisz opinię
      </button>
      {saved && <div className="text-sm text-muted-foreground mt-2">Zapisano.</div>}
    </div>
  );
}
