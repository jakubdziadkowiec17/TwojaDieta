import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ListPagination } from '../components/ListPagination';
import { OrderDetailsDialog } from '../components/OrderDetailsDialog';
import { FieldError, OptionalMark, fieldClassName } from '../components/FormFeedback';
import { Home, ShoppingBag, Heart, MapPin, Settings, LogOut, Eye, KeyRound, EyeOff } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { useData } from '../providers/DataProvider';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { toast } from 'sonner';
import type { PaymentStatus } from '../types';
import {
  firstError,
  type FieldErrors,
  validateCity,
  validateOptionalText,
  validatePassword,
  validatePhone,
  validatePostalCode,
  validateRequiredText,
  validationLimits,
} from '../lib/validation';

function formatDateTime(iso: string): string {
  try {
    return format(new Date(iso), 'dd.MM.yyyy HH:mm', { locale: pl });
  } catch {
    return iso;
  }
}

function paymentStatusClasses(status: PaymentStatus): string {
  if (status === 'Opłacone') return 'bg-primary/10 text-primary';
  if (status === 'Oczekuje na płatność') return 'bg-accent/15 text-accent';
  if (status === 'Zwrócone') return 'bg-secondary text-muted-foreground';
  return 'bg-destructive/10 text-destructive';
}

export function AccountPage() {
  const { user, isAuthenticated, logout, updateProfile, changePassword } = useAuth();
  const { orders, diets, reviews, upsertReview } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = searchParams.get('tab') ?? 'dashboard';
  const [activeTab, setActiveTab] = useState(initialTab);
  const completedOrderId = (location.state as { completedOrderId?: string } | null)?.completedOrderId;
  const guestCompletedOrder = !user && completedOrderId
    ? orders.find((order) => order.id === completedOrderId && order.userId === null) ?? null
    : null;

  const myOrders = useMemo(() => {
    if (!user) return [];
    return orders
      .filter((o) => o.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, user]);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(5);
  const ordersTotalPages = Math.max(1, Math.ceil(myOrders.length / ordersPerPage));
  const paginatedOrders = myOrders.slice(
    (ordersPage - 1) * ordersPerPage,
    ordersPage * ordersPerPage,
  );

  useEffect(() => {
    setOrdersPage((page) => Math.min(page, ordersTotalPages));
  }, [ordersTotalPages]);

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
  const [addressErrors, setAddressErrors] = useState<FieldErrors>({});
  const [profileErrors, setProfileErrors] = useState<FieldErrors>({});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<FieldErrors>({});

  const menuItems = [
    { id: 'dashboard', label: 'Pulpit', icon: Home },
    { id: 'orders', label: 'Moje zamówienia', icon: ShoppingBag },
    { id: 'reviews', label: 'Ocena diet', icon: Heart },
    { id: 'addresses', label: 'Dane dostawy', icon: MapPin },
    { id: 'settings', label: 'Dane konta', icon: Settings },
    { id: 'password', label: 'Zmiana hasła', icon: KeyRound },
  ];

  useEffect(() => {
    const requestedTab = searchParams.get('tab') ?? 'dashboard';
    const isAvailableTab = menuItems.some((item) => item.id === requestedTab);
    setActiveTab(isAvailableTab ? requestedTab : 'dashboard');
  }, [searchParams]);

  const onTabChange = (tab: string) => {
    setActiveTab(tab);
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    setSearchParams(next, { replace: true });
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto max-w-screen-2xl px-8 py-8">
        <Breadcrumbs items={[{ label: 'Strona główna', to: '/' }, { label: 'Konto' }]} />
        <div className="bg-white border border-border rounded-xl p-8 max-w-3xl">
          {guestCompletedOrder ? (
            <>
              <h1 className="text-3xl font-bold mb-2">Zamówienie zostało złożone</h1>
              <p className="text-muted-foreground mb-6">
                Numer zamówienia: <span className="font-medium text-foreground">#{guestCompletedOrder.id}</span>
              </p>
              <div className="border border-border rounded-xl p-4 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="font-bold">Podsumowanie zamówienia</div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Łączna kwota zamówienia</div>
                    <div className="font-bold text-primary">{guestCompletedOrder.total} zł</div>
                  </div>
                </div>
                <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium mb-3 ${paymentStatusClasses(guestCompletedOrder.paymentStatus)}`}>
                  Płatność: {guestCompletedOrder.paymentStatus}
                </div>
                <div className="space-y-2 text-sm">
                  {guestCompletedOrder.items.map((item, index) => (
                    <div key={`${item.dietId}-${index}`} className="flex justify-between gap-4">
                      <span>{item.dietName} • {item.calories} kcal • {item.days} dni</span>
                      <span className="font-medium">Wartość pozycji: {item.pricePerDay * item.days} zł</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
                  <div><span className="font-medium text-foreground">Adres dostawy:</span> {guestCompletedOrder.delivery.addressLine1}, {guestCompletedOrder.delivery.addressPostalCode} {guestCompletedOrder.delivery.addressCity}</div>
                  <div className="mt-1"><span className="font-medium text-foreground">Uwagi:</span> {guestCompletedOrder.delivery.notes?.trim() || 'Brak'}</div>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">
                Zamówienie gościnne nie jest przypisane do konta. Zaloguj się przy kolejnych zakupach, aby mieć dostęp do pełnej historii.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-2">Konto klienta</h1>
              <p className="text-muted-foreground mb-6">
                Zaloguj się lub zarejestruj, aby mieć historię zamówień, dane dostawy i możliwość oceniania diet.
              </p>
            </>
          )}
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
                onClick={handleLogout}
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
                            <OrderDetailsDialog
                              order={order}
                              trigger={(
                                <button type="button" className="text-primary hover:underline text-sm">
                                  Szczegóły
                                </button>
                              )}
                            />
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
                  <>
                  <div className="space-y-4">
                    {paginatedOrders.map((order) => (
                      <div key={order.id} className="border border-border rounded-xl p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <div className="font-bold">Zamówienie #{order.id}</div>
                            <div className="text-sm text-muted-foreground">{formatDateTime(order.createdAt)}</div>
                          </div>
                          <div className="text-right">
                            <OrderDetailsDialog
                              order={order}
                              trigger={(
                                <button type="button" className="text-sm text-primary hover:underline">
                                  Szczegóły
                                </button>
                              )}
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3 text-xs">
                          <span className="bg-secondary text-foreground px-3 py-1 rounded-full font-medium">Status realizacji: {order.status}</span>
                          <span className={`px-3 py-1 rounded-full font-medium ${paymentStatusClasses(order.paymentStatus)}`}>
                            Płatność: {order.paymentStatus}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-4">
                          <div>
                            <span className="font-medium text-foreground">Adres dostawy:</span> {order.delivery.addressLine1}, {order.delivery.addressPostalCode} {order.delivery.addressCity}
                          </div>
                          <div className="mt-1">
                            <span className="font-medium text-foreground">Uwagi:</span> {order.delivery.notes?.trim() || 'Brak'}
                          </div>
                          <div className="mt-1">
                            <span className="font-medium text-foreground">Metoda płatności:</span> {order.paymentMethod}
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
                          <div className="mb-3 flex items-center justify-end gap-2">
                            <span className="font-medium text-foreground">Łączna kwota zamówienia:</span>
                            <span className="text-lg font-bold text-primary">{order.total} zł</span>
                          </div>
                          {order.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>{it.dietName} • {it.calories} kcal • {it.days} dni</span>
                              <span className="font-medium">Wartość pozycji: {it.pricePerDay * it.days} zł</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <ListPagination
                    currentPage={ordersPage}
                    totalPages={ordersTotalPages}
                    onPageChange={setOrdersPage}
                    itemsPerPage={ordersPerPage}
                    onItemsPerPageChange={setOrdersPerPage}
                    totalItems={myOrders.length}
                  />
                  </>
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
                              toast.success(existing ? 'Opinia została zaktualizowana.' : 'Opinia została dodana.');
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
                <form
                  className="grid sm:grid-cols-2 gap-4"
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault();
                    const nextErrors: FieldErrors = {};
                    const addressError = validateRequiredText(profileForm.addressLine1, 'Adres', 5, validationLimits.addressMax);
                    const cityError = validateCity(profileForm.addressCity, true, true);
                    const postalCodeError = validatePostalCode(profileForm.addressPostalCode);
                    if (addressError) nextErrors.addressLine1 = addressError;
                    if (cityError) nextErrors.addressCity = cityError;
                    if (postalCodeError) nextErrors.addressPostalCode = postalCodeError;
                    setAddressErrors(nextErrors);
                    if (firstError(nextErrors)) return;
                    const res = updateProfile({
                      addressLine1: profileForm.addressLine1,
                      addressCity: profileForm.addressCity,
                      addressPostalCode: profileForm.addressPostalCode,
                    });
                    if (res.ok) {
                      setProfileMsg(null);
                      toast.success('Dane dostawy zostały zapisane.');
                    } else {
                      setProfileMsg(res.error);
                    }
                  }}
                >
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-2">Adres</label>
                    <input
                      value={profileForm.addressLine1}
                      maxLength={validationLimits.addressMax}
                      autoComplete="street-address"
                      placeholder="Ulica, numer domu/mieszkania"
                      onChange={(e) => {
                        setProfileForm((p) => ({ ...p, addressLine1: e.target.value }));
                        setAddressErrors((errors) => ({ ...errors, addressLine1: '' }));
                      }}
                      aria-invalid={!!addressErrors.addressLine1}
                      className={`w-full px-4 py-2 border rounded-lg ${fieldClassName(addressErrors.addressLine1)}`}
                    />
                    <FieldError message={addressErrors.addressLine1} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Miasto</label>
                    <input
                      value={profileForm.addressCity}
                      maxLength={validationLimits.cityMax}
                      autoComplete="address-level2"
                      onChange={(e) => {
                        setProfileForm((p) => ({ ...p, addressCity: e.target.value }));
                        setAddressErrors((errors) => ({ ...errors, addressCity: '' }));
                      }}
                      aria-invalid={!!addressErrors.addressCity}
                      className={`w-full px-4 py-2 border rounded-lg ${fieldClassName(addressErrors.addressCity)}`}
                    />
                    <FieldError message={addressErrors.addressCity} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Kod pocztowy</label>
                    <input
                      value={profileForm.addressPostalCode}
                      maxLength={6}
                      inputMode="numeric"
                      autoComplete="postal-code"
                      placeholder="00-000"
                      onChange={(e) => {
                        setProfileForm((p) => ({ ...p, addressPostalCode: e.target.value }));
                        setAddressErrors((errors) => ({ ...errors, addressPostalCode: '' }));
                      }}
                      aria-invalid={!!addressErrors.addressPostalCode}
                      className={`w-full px-4 py-2 border rounded-lg ${fieldClassName(addressErrors.addressPostalCode)}`}
                    />
                    <FieldError message={addressErrors.addressPostalCode} />
                  </div>
                  <button
                    type="submit"
                    className="sm:col-span-2 mt-2 w-fit px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    Zapisz
                  </button>
                </form>
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
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault();
                    const nextErrors: FieldErrors = {};
                    const firstNameError = validateRequiredText(profileForm.firstName, 'Imię', 2, validationLimits.nameMax);
                    const lastNameError = validateRequiredText(profileForm.lastName, 'Nazwisko', 2, validationLimits.nameMax);
                    const phoneError = validatePhone(profileForm.phone, false);
                    if (firstNameError) nextErrors.firstName = firstNameError;
                    if (lastNameError) nextErrors.lastName = lastNameError;
                    if (phoneError) nextErrors.phone = phoneError;
                    setProfileErrors(nextErrors);
                    if (firstError(nextErrors)) return;
                    const res = updateProfile({
                      firstName: profileForm.firstName,
                      lastName: profileForm.lastName,
                      phone: profileForm.phone,
                    });
                    if (res.ok) {
                      setProfileMsg(null);
                      toast.success('Dane konta zostały zapisane.');
                    } else {
                      setProfileMsg(res.error);
                    }
                    window.setTimeout(() => setProfileMsg(null), 2000);
                  }}
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Imię</label>
                      <input
                        type="text"
                        value={profileForm.firstName}
                        maxLength={validationLimits.nameMax}
                        autoComplete="given-name"
                        onChange={(e) => {
                          setProfileForm((p) => ({ ...p, firstName: e.target.value }));
                          setProfileErrors((errors) => ({ ...errors, firstName: '' }));
                        }}
                        aria-invalid={!!profileErrors.firstName}
                        className={`w-full px-4 py-2 border rounded-lg ${fieldClassName(profileErrors.firstName)}`}
                      />
                      <FieldError message={profileErrors.firstName} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Nazwisko</label>
                      <input
                        type="text"
                        value={profileForm.lastName}
                        maxLength={validationLimits.nameMax}
                        autoComplete="family-name"
                        onChange={(e) => {
                          setProfileForm((p) => ({ ...p, lastName: e.target.value }));
                          setProfileErrors((errors) => ({ ...errors, lastName: '' }));
                        }}
                        aria-invalid={!!profileErrors.lastName}
                        className={`w-full px-4 py-2 border rounded-lg ${fieldClassName(profileErrors.lastName)}`}
                      />
                      <FieldError message={profileErrors.lastName} />
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
                    <label className="block text-sm font-medium mb-2">Telefon<OptionalMark /></label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      maxLength={validationLimits.phoneMax}
                      autoComplete="tel"
                      placeholder="501 234 567"
                      onChange={(e) => {
                        setProfileForm((p) => ({ ...p, phone: e.target.value }));
                        setProfileErrors((errors) => ({ ...errors, phone: '' }));
                      }}
                      aria-invalid={!!profileErrors.phone}
                      className={`w-full px-4 py-2 border rounded-lg ${fieldClassName(profileErrors.phone)}`}
                    />
                    <FieldError message={profileErrors.phone} />
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

          {activeTab === 'password' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Zmiana hasła</h2>
              <div className="bg-white border border-border rounded-xl p-6">
                <p className="text-muted-foreground mb-6">
                  Podaj bieżące hasło, a następnie ustaw nowe hasło do logowania.
                </p>
                <form
                  className="space-y-4 max-w-xl"
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault();
                    setPasswordError(null);
                    const nextErrors: FieldErrors = {};
                    if (!passwordForm.currentPassword) nextErrors.currentPassword = 'Bieżące hasło jest wymagane.';
                    const newPasswordError = validatePassword(passwordForm.newPassword, 'Nowe hasło');
                    if (newPasswordError) nextErrors.newPassword = newPasswordError;
                    if (!passwordForm.confirmPassword) nextErrors.confirmPassword = 'Powtórzenie hasła jest wymagane.';
                    else if (passwordForm.newPassword !== passwordForm.confirmPassword) nextErrors.confirmPassword = 'Nowe hasła nie są takie same.';
                    setPasswordFieldErrors(nextErrors);
                    if (firstError(nextErrors)) return;
                    const result = changePassword({
                      currentPassword: passwordForm.currentPassword,
                      newPassword: passwordForm.newPassword,
                    });
                    if (!result.ok) {
                      setPasswordError(result.error);
                      return;
                    }
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    toast.success('Hasło zostało zmienione.');
                  }}
                >
                  {passwordError && (
                    <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3">
                      {passwordError}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-2">Bieżące hasło</label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      maxLength={validationLimits.passwordMax}
                      autoComplete="current-password"
                      onChange={(e) => {
                        setPasswordForm((form) => ({ ...form, currentPassword: e.target.value }));
                        setPasswordFieldErrors((errors) => ({ ...errors, currentPassword: '' }));
                      }}
                      aria-invalid={!!passwordFieldErrors.currentPassword}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${fieldClassName(passwordFieldErrors.currentPassword)}`}
                    />
                    <FieldError message={passwordFieldErrors.currentPassword} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nowe hasło</label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      maxLength={validationLimits.passwordMax}
                      autoComplete="new-password"
                      onChange={(e) => {
                        setPasswordForm((form) => ({ ...form, newPassword: e.target.value }));
                        setPasswordFieldErrors((errors) => ({ ...errors, newPassword: '', confirmPassword: '' }));
                      }}
                      aria-invalid={!!passwordFieldErrors.newPassword}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${fieldClassName(passwordFieldErrors.newPassword)}`}
                    />
                    <FieldError message={passwordFieldErrors.newPassword} />
                    {!passwordFieldErrors.newPassword && <p className="mt-1 text-xs text-muted-foreground">Minimum 8 znaków, w tym litera i cyfra.</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Powtórz nowe hasło</label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      maxLength={validationLimits.passwordMax}
                      autoComplete="new-password"
                      onChange={(e) => {
                        setPasswordForm((form) => ({ ...form, confirmPassword: e.target.value }));
                        setPasswordFieldErrors((errors) => ({ ...errors, confirmPassword: '' }));
                      }}
                      aria-invalid={!!passwordFieldErrors.confirmPassword}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${fieldClassName(passwordFieldErrors.confirmPassword)}`}
                    />
                    <FieldError message={passwordFieldErrors.confirmPassword} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showPasswords ? 'Ukryj hasła' : 'Pokaż hasła'}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    Zmień hasło
                  </button>
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
  const [commentError, setCommentError] = useState<string | undefined>();

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
          <label className="block text-sm font-medium mb-2">Komentarz<OptionalMark /></label>
          <textarea
            value={comment}
            maxLength={validationLimits.reviewMax}
            onChange={(e) => {
              setComment(e.target.value);
              setCommentError(undefined);
            }}
            aria-invalid={!!commentError}
            className={`w-full px-4 py-2 border rounded-lg min-h-[90px] ${fieldClassName(commentError)}`}
            placeholder="Co Ci się podobało?"
          />
          <FieldError message={commentError} />
          <p className="mt-1 text-xs text-muted-foreground">{comment.length}/{validationLimits.reviewMax}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          const nextError = validateOptionalText(comment, 'Komentarz', validationLimits.reviewMax);
          setCommentError(nextError);
          if (nextError) return;
          onSave(rating, comment);
        }}
        className="mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
      >
        Zapisz opinię
      </button>
    </div>
  );
}
