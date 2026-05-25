import { useEffect, useMemo, useState } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ListPagination } from '../components/ListPagination';
import { OrderDetailsDialog } from '../components/OrderDetailsDialog';
import { FieldError, OptionalMark, fieldClassName } from '../components/FormFeedback';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import { ShoppingCart, Users, Calendar, Truck, TrendingUp, Percent } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../providers/DataProvider';
import { useAuth } from '../providers/AuthProvider';
import type { Diet, DiscountKind, OrderStatus, PaymentStatus } from '../types';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { formatVariantsInput, getMinPrice, parseVariantsInput } from '../lib/dietVariants';
import { toast } from 'sonner';
import {
  firstError,
  type FieldErrors,
  validateCouponCode,
  validateDietVariants,
  validateOptionalText,
  validateOptionalUrl,
  validateOptionalUrlList,
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

function parseCsvStrings(value: string): string[] {
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

function paymentStatusClasses(status: PaymentStatus): string {
  if (status === 'Opłacone') return 'bg-primary/10 text-primary';
  if (status === 'Oczekuje na płatność') return 'bg-accent/15 text-accent';
  if (status === 'Zwrócone') return 'bg-secondary text-muted-foreground';
  return 'bg-destructive/10 text-destructive';
}

const ADMIN_DEFAULT_PAGE_SIZE = 5;

export function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const {
    diets,
    orders,
    discountCodes,
    addDiet,
    updateDiet,
    deleteDiet,
    updateOrderStatus,
    addDiscountCode,
    setDiscountCodeActive,
    deleteDiscountCode,
  } = useData();
  const { users } = useAuth();

  const chartData = useMemo(() => {
    const days = 7;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const buckets: { date: string; orders: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      buckets.push({ date: format(d, 'd MMM', { locale: pl }), orders: 0 });
    }

    for (const o of orders) {
      const d = new Date(o.createdAt);
      d.setHours(0, 0, 0, 0);
      const diffDays = Math.round((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < days) {
        const idx = days - 1 - diffDays;
        buckets[idx].orders += 1;
      }
    }
    return buckets;
  }, [orders]);

  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + o.total, 0), [orders]);
  const customersCount = useMemo(() => users.filter((u) => u.role === 'customer').length, [users]);
  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders],
  );
  const sortedDiets = useMemo(
    () => [...diets].sort((a, b) => a.name.localeCompare(b.name, 'pl')),
    [diets],
  );
  const sortedClients = useMemo(
    () =>
      [...users].sort((a, b) =>
        `${a.profile.firstName} ${a.profile.lastName}`.localeCompare(
          `${b.profile.firstName} ${b.profile.lastName}`,
          'pl',
        ),
      ),
    [users],
  );
  const sortedDiscountCodes = useMemo(
    () => [...discountCodes].sort((a, b) => a.code.localeCompare(b.code, 'pl')),
    [discountCodes],
  );
  const popularDiets = useMemo(
    () =>
      [...diets]
        .map((diet) => ({
          diet,
          orderCount: orders.filter((order) =>
            order.items.some((item) => item.dietId === diet.id),
          ).length,
        }))
        .sort((a, b) => b.orderCount - a.orderCount || a.diet.name.localeCompare(b.diet.name, 'pl'))
        .slice(0, 5),
    [diets, orders],
  );

  const [ordersPage, setOrdersPage] = useState(1);
  const [dietsPage, setDietsPage] = useState(1);
  const [clientsPage, setClientsPage] = useState(1);
  const [discountsPage, setDiscountsPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(ADMIN_DEFAULT_PAGE_SIZE);
  const [dietsPerPage, setDietsPerPage] = useState(ADMIN_DEFAULT_PAGE_SIZE);
  const [clientsPerPage, setClientsPerPage] = useState(ADMIN_DEFAULT_PAGE_SIZE);
  const [discountsPerPage, setDiscountsPerPage] = useState(ADMIN_DEFAULT_PAGE_SIZE);
  const ordersTotalPages = Math.max(1, Math.ceil(orders.length / ordersPerPage));
  const dietsTotalPages = Math.max(1, Math.ceil(sortedDiets.length / dietsPerPage));
  const clientsTotalPages = Math.max(1, Math.ceil(sortedClients.length / clientsPerPage));
  const discountsTotalPages = Math.max(1, Math.ceil(sortedDiscountCodes.length / discountsPerPage));
  const paginatedOrders = sortedOrders.slice((ordersPage - 1) * ordersPerPage, ordersPage * ordersPerPage);
  const paginatedDiets = sortedDiets.slice((dietsPage - 1) * dietsPerPage, dietsPage * dietsPerPage);
  const paginatedClients = sortedClients.slice((clientsPage - 1) * clientsPerPage, clientsPage * clientsPerPage);
  const paginatedDiscountCodes = sortedDiscountCodes.slice(
    (discountsPage - 1) * discountsPerPage,
    discountsPage * discountsPerPage,
  );

  useEffect(() => setOrdersPage((page) => Math.min(page, ordersTotalPages)), [ordersTotalPages]);
  useEffect(() => setDietsPage((page) => Math.min(page, dietsTotalPages)), [dietsTotalPages]);
  useEffect(() => setClientsPage((page) => Math.min(page, clientsTotalPages)), [clientsTotalPages]);
  useEffect(() => setDiscountsPage((page) => Math.min(page, discountsTotalPages)), [discountsTotalPages]);

  const [editingDietId, setEditingDietId] = useState<string | null>(null);
  const editingDiet = editingDietId ? diets.find((d) => d.id === editingDietId) ?? null : null;
  const [dietForm, setDietForm] = useState(() => ({
    name: '',
    shortDescription: '',
    description: '',
    image: '',
    images: '',
    variants: '1500:59, 2000:69',
    goal: 'Zdrowe odżywianie',
    tags: 'Zdrowe odżywianie',
    allergens: '',
    sampleMenu: '',
  }));
  const [dietErrors, setDietErrors] = useState<FieldErrors>({});
  const [discountForm, setDiscountForm] = useState<{ code: string; kind: DiscountKind; value: string }>({
    code: '',
    kind: 'percentage',
    value: '10',
  });
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [discountCodeError, setDiscountCodeError] = useState<string | null>(null);
  const [discountValueError, setDiscountValueError] = useState<string | null>(null);

  const loadDietToForm = (diet: Diet) => {
    setDietForm({
      name: diet.name,
      shortDescription: diet.shortDescription,
      description: diet.description,
      image: diet.image,
      images: diet.images.join(', '),
      variants: formatVariantsInput(diet.variants),
      goal: diet.goal ?? '',
      tags: diet.tags.join(', '),
      allergens: diet.allergens.join(', '),
      sampleMenu: diet.sampleMenu.join('\n'),
    });
  };

  const resetDietForm = () => {
    setEditingDietId(null);
    setDietErrors({});
    setDietForm({
      name: '',
      shortDescription: '',
      description: '',
      image: '',
      images: '',
      variants: '1500:59, 2000:69',
      goal: 'Zdrowe odżywianie',
      tags: 'Zdrowe odżywianie',
      allergens: '',
      sampleMenu: '',
    });
  };

  const menuItems = [
    { id: 'dashboard', label: 'Pulpit', icon: TrendingUp },
    { id: 'orders', label: 'Zamówienia', icon: ShoppingCart },
    { id: 'diets', label: 'Diety', icon: Calendar },
    { id: 'clients', label: 'Klienci', icon: Users },
    { id: 'deliveries', label: 'Dostawy', icon: Truck },
    { id: 'discounts', label: 'Rabaty', icon: Percent },
  ];

  return (
    <div className="container mx-auto max-w-screen-2xl px-8 py-8">
      <Breadcrumbs
        items={[
          { label: 'Strona główna', to: '/' },
          { label: 'Panel administratora' },
        ]}
      />

      <div className="grid lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="bg-white border border-border rounded-xl p-4">
            <h3 className="font-bold mb-4">PULPIT</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Witamy w panelu administratora!
            </p>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === item.id
                      ? 'bg-primary text-white'
                      : 'hover:bg-secondary text-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <main className="lg:col-span-3">
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">PULPIT</h2>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <ShoppingCart className="w-8 h-8 text-primary" />
                    <span className="text-2xl font-bold">{orders.length}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Nowe zamówienia</div>
                  <div className="text-xs text-muted-foreground">
                    (łącznie)
                  </div>
                </div>

                <div className="bg-white border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-8 h-8 text-primary" />
                    <span className="text-2xl font-bold">{customersCount}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Klienci</div>
                  <div className="text-xs text-muted-foreground">(łącznie)</div>
                </div>

                <div className="bg-white border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="w-8 h-8 text-primary" />
                    <span className="text-2xl font-bold">{diets.length}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Aktywne diety</div>
                  <div className="text-xs text-muted-foreground">(w ofercie)</div>
                </div>

                <div className="bg-white border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Truck className="w-8 h-8 text-primary" />
                    <span className="text-2xl font-bold">{totalRevenue} zł</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Przychód</div>
                  <div className="text-xs text-muted-foreground">(łącznie)</div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white border border-border rounded-xl p-6">
                  <h3 className="font-bold mb-4">ZAMÓWIENIA - OSTATNIE 7 DNI</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="orders"
                        name="Zamówienia"
                        stroke="#2F6B3B"
                        fill="#8BCF7A"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white border border-border rounded-xl p-6">
                  <h3 className="font-bold mb-4">NAJPOPULARNIEJSZE DIETY</h3>
                  <div className="space-y-3">
                    {popularDiets.map(({ diet, orderCount }, index) => (
                      <div key={diet.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-muted-foreground">
                            {index + 1}
                          </span>
                          <span className="font-medium">{diet.name}</span>
                        </div>
                        <span className="text-primary font-bold">
                          {orderCount} zamówień
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">OSTATNIE ZAMÓWIENIA</h3>
                  <button type="button" onClick={() => setActiveTab('orders')} className="text-sm text-primary hover:underline">
                    Zobacz wszystkie zamówienia →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Numer zamówienia</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Klient</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Dieta</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Data</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Kwota</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Akcje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedOrders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="border-b border-border last:border-b-0">
                          <td className="px-4 py-3">#{order.id}</td>
                          <td className="px-4 py-3">{order.customer.firstName} {order.customer.lastName}</td>
                          <td className="px-4 py-3">{order.items.map((i) => i.dietName).join(', ')}</td>
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
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Zamówienia</h2>
              <div className="bg-white border border-border rounded-xl p-6">
                {orders.length === 0 ? (
                  <p className="text-muted-foreground">Brak zamówień.</p>
                ) : (
                  <>
                  <div className="space-y-4">
                    {paginatedOrders.map((order) => (
                      <div key={order.id} className="border border-border rounded-xl p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <div className="font-bold">#{order.id} • {order.customer.firstName} {order.customer.lastName}</div>
                            <div className="text-sm text-muted-foreground">{formatDateTime(order.createdAt)} • {order.customer.email}</div>
                          </div>
                          <div className="flex flex-wrap items-end justify-end gap-3">
                            <label className="text-xs font-medium text-muted-foreground">
                              Status realizacji
                              <select
                                value={order.status}
                                onChange={(e) => {
                                  const status = e.target.value as OrderStatus;
                                  updateOrderStatus(order.id, status);
                                  toast.success(`Zmieniono status zamówienia na: ${status}.`);
                                }}
                                className="block mt-1 px-3 py-2 border border-border rounded-lg font-medium text-foreground bg-white"
                              >
                                {(['Nowe', 'W trakcie', 'Dostarczone', 'Anulowane'] as OrderStatus[]).map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </label>
                            <div>
                              <div className="text-xs font-medium text-muted-foreground mb-1">Status płatności</div>
                              <span className={`inline-flex px-3 py-2 rounded-full text-sm font-medium ${paymentStatusClasses(order.paymentStatus)}`}>
                                {order.paymentStatus}
                              </span>
                            </div>
                            <OrderDetailsDialog
                              order={order}
                              trigger={(
                                <button type="button" className="px-3 py-2 text-sm text-primary hover:underline">
                                  Szczegóły
                                </button>
                              )}
                            />
                          </div>
                        </div>

                        <div className="mt-4 border-t border-border pt-4 text-sm">
                          <div className="text-muted-foreground">
                            <span className="font-medium text-foreground">Adres dostawy:</span> {order.delivery.addressLine1}, {order.delivery.addressPostalCode} {order.delivery.addressCity}
                          </div>
                          <div className="text-muted-foreground mt-1">
                            <span className="font-medium text-foreground">Uwagi:</span> {order.delivery.notes?.trim() || 'Brak'}
                          </div>
                          <div className="text-muted-foreground mt-1">
                            <span className="font-medium text-foreground">Metoda płatności:</span> {order.paymentMethod}
                          </div>
                          <div className="mt-4 space-y-2">
                            <div className="mb-3 flex items-center justify-end gap-2">
                              <span className="font-medium text-foreground">Łączna kwota zamówienia:</span>
                              <span className="text-lg font-bold text-primary">{order.total} zł</span>
                            </div>
                            {order.items.map((it, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span>{it.dietName} • {it.calories} kcal • {it.days} dni • start: {it.startDate}</span>
                                <span className="font-medium">Wartość pozycji: {it.pricePerDay * it.days} zł</span>
                              </div>
                            ))}
                          </div>
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
                    totalItems={orders.length}
                  />
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'diets' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Diety</h2>
                <button
                  type="button"
                  onClick={resetDietForm}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-secondary"
                >
                  Dodaj nową
                </button>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white border border-border rounded-xl p-6">
                  <h3 className="font-bold mb-4">Lista diet</h3>
                  <div className="space-y-2">
                    {paginatedDiets.map((d) => (
                      <div key={d.id} className="flex items-center justify-between border border-border rounded-lg p-3">
                        <div>
                          <div className="font-medium">{d.name}</div>
                          <div className="text-sm text-muted-foreground">od {getMinPrice(d)} zł/dzień • {d.goal ?? '-'}</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="px-3 py-2 border border-border rounded-lg hover:bg-secondary"
                            onClick={() => {
                              setEditingDietId(d.id);
                              setDietErrors({});
                              loadDietToForm(d);
                            }}
                          >
                            Edytuj
                          </button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                type="button"
                                className="px-3 py-2 border border-border rounded-lg hover:bg-destructive/10 text-destructive"
                              >
                                Usuń
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Usunąć dietę?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Dieta „{d.name}” zniknie z oferty. Tej akcji nie można cofnąć.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Anuluj</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-white hover:bg-destructive/90"
                                  onClick={() => {
                                    deleteDiet(d.id);
                                    if (editingDietId === d.id) resetDietForm();
                                    toast.success('Dieta została usunięta.');
                                  }}
                                >
                                  Usuń
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                  <ListPagination
                    currentPage={dietsPage}
                    totalPages={dietsTotalPages}
                    onPageChange={setDietsPage}
                    itemsPerPage={dietsPerPage}
                    onItemsPerPageChange={setDietsPerPage}
                    totalItems={sortedDiets.length}
                  />
                </div>

                <div className="bg-white border border-border rounded-xl p-6">
                  <h3 className="font-bold mb-4">{editingDiet ? 'Edycja diety' : 'Dodaj dietę'}</h3>
                  <form
                    className="space-y-4"
                    noValidate
                    onSubmit={(e) => {
                      e.preventDefault();

                      const variants = parseVariantsInput(dietForm.variants);
                      const nextErrors: FieldErrors = {};
                      const nameError = validateRequiredText(dietForm.name, 'Nazwa', 2, validationLimits.dietNameMax);
                      const shortError = validateRequiredText(dietForm.shortDescription, 'Krótki opis', 10, validationLimits.shortDescriptionMax);
                      const descriptionError = validateRequiredText(dietForm.description, 'Opis', 20, validationLimits.descriptionMax);
                      const imageError = validateOptionalUrl(dietForm.image, 'URL miniatury');
                      const imagesError = validateOptionalUrlList(dietForm.images);
                      const variantsError = validateDietVariants(dietForm.variants);
                      const menuError = validateOptionalText(dietForm.sampleMenu, 'Przykładowe menu', validationLimits.menuMax);
                      if (nameError) nextErrors.name = nameError;
                      if (shortError) nextErrors.shortDescription = shortError;
                      if (descriptionError) nextErrors.description = descriptionError;
                      if (imageError) nextErrors.image = imageError;
                      if (imagesError) nextErrors.images = imagesError;
                      if (variantsError) nextErrors.variants = variantsError;
                      if (menuError) nextErrors.sampleMenu = menuError;
                      setDietErrors(nextErrors);
                      if (firstError(nextErrors)) return;

                      const image = dietForm.image.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop';
                      const images = parseCsvStrings(dietForm.images);
                      const dietPayload = {
                        name: dietForm.name.trim(),
                        shortDescription: dietForm.shortDescription.trim(),
                        description: dietForm.description.trim(),
                        image,
                        images: images.length ? images : [image],
                        variants,
                        tags: parseCsvStrings(dietForm.tags),
                        goal: dietForm.goal.trim() || undefined,
                        allergens: parseCsvStrings(dietForm.allergens),
                        sampleMenu: dietForm.sampleMenu
                          .split('\n')
                          .map((l) => l.trim())
                          .filter(Boolean),
                      };

                      if (editingDiet) {
                        updateDiet(editingDiet.id, dietPayload);
                        toast.success('Dieta została zaktualizowana.');
                      } else {
                        addDiet(dietPayload);
                        toast.success('Dieta została dodana.');
                      }
                      resetDietForm();
                    }}
                  >
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Nazwa</label>
                        <input value={dietForm.name} maxLength={validationLimits.dietNameMax} onChange={(e) => { setDietForm((f) => ({ ...f, name: e.target.value })); setDietErrors((errors) => ({ ...errors, name: '' })); }} aria-invalid={!!dietErrors.name} className={`w-full px-4 py-2 border rounded-lg ${fieldClassName(dietErrors.name)}`} />
                        <FieldError message={dietErrors.name} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-2">Krótki opis</label>
                        <input value={dietForm.shortDescription} maxLength={validationLimits.shortDescriptionMax} onChange={(e) => { setDietForm((f) => ({ ...f, shortDescription: e.target.value })); setDietErrors((errors) => ({ ...errors, shortDescription: '' })); }} aria-invalid={!!dietErrors.shortDescription} className={`w-full px-4 py-2 border rounded-lg ${fieldClassName(dietErrors.shortDescription)}`} />
                        <FieldError message={dietErrors.shortDescription} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-2">Opis</label>
                        <textarea value={dietForm.description} maxLength={validationLimits.descriptionMax} onChange={(e) => { setDietForm((f) => ({ ...f, description: e.target.value })); setDietErrors((errors) => ({ ...errors, description: '' })); }} aria-invalid={!!dietErrors.description} className={`w-full px-4 py-2 border rounded-lg min-h-[120px] ${fieldClassName(dietErrors.description)}`} />
                        <FieldError message={dietErrors.description} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-2">URL zdjęcia (miniatura)<OptionalMark /></label>
                        <input value={dietForm.image} maxLength={validationLimits.csvMax} onChange={(e) => { setDietForm((f) => ({ ...f, image: e.target.value })); setDietErrors((errors) => ({ ...errors, image: '' })); }} aria-invalid={!!dietErrors.image} className={`w-full px-4 py-2 border rounded-lg ${fieldClassName(dietErrors.image)}`} />
                        <FieldError message={dietErrors.image} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-2">URL zdjęć (CSV)<OptionalMark /></label>
                        <input value={dietForm.images} maxLength={validationLimits.csvMax} onChange={(e) => { setDietForm((f) => ({ ...f, images: e.target.value })); setDietErrors((errors) => ({ ...errors, images: '' })); }} aria-invalid={!!dietErrors.images} className={`w-full px-4 py-2 border rounded-lg ${fieldClassName(dietErrors.images)}`} placeholder="url1, url2, url3" />
                        <FieldError message={dietErrors.images} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-2">Warianty: kaloryczność:cena / dzień (CSV)</label>
                        <input value={dietForm.variants} maxLength={validationLimits.csvMax} onChange={(e) => { setDietForm((f) => ({ ...f, variants: e.target.value })); setDietErrors((errors) => ({ ...errors, variants: '' })); }} aria-invalid={!!dietErrors.variants} className={`w-full px-4 py-2 border rounded-lg ${fieldClassName(dietErrors.variants)}`} placeholder="1500:69, 2000:79, 2500:89" />
                        <FieldError message={dietErrors.variants} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Cel<OptionalMark /></label>
                        <input value={dietForm.goal} maxLength={validationLimits.shortDescriptionMax} onChange={(e) => setDietForm((f) => ({ ...f, goal: e.target.value }))} className="w-full px-4 py-2 border border-border rounded-lg" placeholder="Utrata wagi / Budowa masy mięśniowej / Zdrowe odżywianie" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-2">Tagi / preferencje (CSV)<OptionalMark /></label>
                        <input value={dietForm.tags} maxLength={validationLimits.csvMax} onChange={(e) => setDietForm((f) => ({ ...f, tags: e.target.value }))} className="w-full px-4 py-2 border border-border rounded-lg" placeholder="Wegetariańska, Keto, Bezglutenowa..." />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-2">Alergeny (CSV)<OptionalMark /></label>
                        <input value={dietForm.allergens} maxLength={validationLimits.csvMax} onChange={(e) => setDietForm((f) => ({ ...f, allergens: e.target.value }))} className="w-full px-4 py-2 border border-border rounded-lg" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-2">Przykładowe menu (1 linia = 1 pozycja)<OptionalMark /></label>
                        <textarea value={dietForm.sampleMenu} maxLength={validationLimits.menuMax} onChange={(e) => { setDietForm((f) => ({ ...f, sampleMenu: e.target.value })); setDietErrors((errors) => ({ ...errors, sampleMenu: '' })); }} aria-invalid={!!dietErrors.sampleMenu} className={`w-full px-4 py-2 border rounded-lg min-h-[140px] ${fieldClassName(dietErrors.sampleMenu)}`} />
                        <FieldError message={dietErrors.sampleMenu} />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button type="submit" className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90">
                        {editingDiet ? 'Zapisz' : 'Dodaj'}
                      </button>
                      {editingDiet && (
                        <button type="button" onClick={resetDietForm} className="px-6 py-3 border border-border rounded-lg hover:bg-secondary">
                          Anuluj
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clients' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Klienci</h2>
              <div className="bg-white border border-border rounded-xl p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">E-mail</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Imię i nazwisko</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Rola</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedClients.map((u) => (
                        <tr key={u.id} className="border-b border-border last:border-b-0">
                          <td className="px-4 py-3">{u.email}</td>
                          <td className="px-4 py-3">{u.profile.firstName} {u.profile.lastName}</td>
                          <td className="px-4 py-3">{u.role === 'admin' ? 'Administrator' : 'Klient'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <ListPagination
                  currentPage={clientsPage}
                  totalPages={clientsTotalPages}
                  onPageChange={setClientsPage}
                  itemsPerPage={clientsPerPage}
                  onItemsPerPageChange={setClientsPerPage}
                  totalItems={sortedClients.length}
                />
              </div>
            </div>
          )}

          {activeTab === 'deliveries' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Dostawy</h2>
              <div className="bg-white border border-border rounded-xl p-6">
                <p className="text-muted-foreground">
                  Dostawa jest darmowa dla zamówień powyżej 250 zł. W innym przypadku koszt dostawy wynosi 15 zł.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'discounts' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Rabaty</h2>
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white border border-border rounded-xl p-6">
                  <h3 className="font-bold mb-4">Dodaj kod rabatowy</h3>
                  <form
                    className="space-y-4"
                    noValidate
                    onSubmit={(e) => {
                      e.preventDefault();
                      setDiscountError(null);
                      setDiscountCodeError(null);
                      setDiscountValueError(null);
                      const codeError = validateCouponCode(discountForm.code, true);
                      if (codeError) {
                        setDiscountCodeError(codeError);
                        return;
                      }
                      const discountValue = Number(discountForm.value);
                      if (!Number.isFinite(discountValue) || discountValue <= 0) {
                        setDiscountValueError('Podaj dodatnią wartość rabatu.');
                        return;
                      }
                      if (discountForm.kind === 'percentage' && discountValue > 100) {
                        setDiscountValueError('Rabat procentowy nie może przekraczać 100%.');
                        return;
                      }
                      const result = addDiscountCode({
                        code: discountForm.code,
                        kind: discountForm.kind,
                        value: discountValue,
                      });
                      if (!result.ok) {
                        setDiscountError(result.error);
                        return;
                      }
                      setDiscountForm({ code: '', kind: 'percentage', value: '10' });
                      toast.success('Kod rabatowy został utworzony.');
                    }}
                  >
                    {discountError && (
                      <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3">
                        {discountError}
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium mb-2">Kod</label>
                      <input
                        value={discountForm.code}
                        maxLength={validationLimits.couponMax}
                        onChange={(e) => {
                          setDiscountForm((form) => ({ ...form, code: e.target.value.toUpperCase() }));
                          setDiscountCodeError(null);
                        }}
                        aria-invalid={!!discountCodeError}
                        className={`w-full px-4 py-2 border rounded-lg uppercase ${fieldClassName(discountCodeError ?? undefined)}`}
                        placeholder="NP. LATO20"
                      />
                      <FieldError message={discountCodeError ?? undefined} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Rodzaj rabatu</label>
                      <select
                        value={discountForm.kind}
                        onChange={(e) => setDiscountForm((form) => ({ ...form, kind: e.target.value as DiscountKind }))}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-white"
                      >
                        <option value="percentage">Procent od produktów</option>
                        <option value="fixed">Kwota od produktów</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {discountForm.kind === 'percentage' ? 'Wartość (%)' : 'Wartość (zł)'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={discountForm.kind === 'percentage' ? '100' : undefined}
                        step="1"
                        required
                        value={discountForm.value}
                        onChange={(e) => {
                          setDiscountForm((form) => ({ ...form, value: e.target.value }));
                          setDiscountValueError(null);
                        }}
                        aria-invalid={!!discountValueError}
                        className={`w-full px-4 py-2 border rounded-lg ${fieldClassName(discountValueError ?? undefined)}`}
                      />
                      <FieldError message={discountValueError ?? undefined} />
                    </div>
                    <button type="submit" className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90">
                      Dodaj kod
                    </button>
                  </form>
                </div>

                <div className="bg-white border border-border rounded-xl p-6">
                  <h3 className="font-bold mb-4">Dostępne kody</h3>
                  {discountCodes.length === 0 ? (
                    <p className="text-muted-foreground">Brak utworzonych kodów rabatowych.</p>
                  ) : (
                    <>
                    <div className="space-y-3">
                      {paginatedDiscountCodes.map((discount) => (
                        <div key={discount.id} className="border border-border rounded-lg p-4">
                          <div className="flex flex-wrap justify-between items-start gap-3">
                            <div>
                              <div className="font-bold">{discount.code}</div>
                              <div className="text-sm text-muted-foreground">
                                {discount.kind === 'percentage' && `${discount.value}% od produktów`}
                                {discount.kind === 'fixed' && `${discount.value} zł od produktów`}
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs ${discount.active ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                              {discount.active ? 'Aktywny' : 'Nieaktywny'}
                            </span>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button
                              type="button"
                              onClick={() => {
                                setDiscountCodeActive(discount.id, !discount.active);
                                toast.success(discount.active ? 'Kod rabatowy został wyłączony.' : 'Kod rabatowy został włączony.');
                              }}
                              className="px-3 py-2 border border-border rounded-lg hover:bg-secondary text-sm"
                            >
                              {discount.active ? 'Wyłącz' : 'Włącz'}
                            </button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button
                                  type="button"
                                  className="px-3 py-2 border border-border rounded-lg hover:bg-destructive/10 text-destructive text-sm"
                                >
                                  Usuń
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Usunąć kod rabatowy?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Kod „{discount.code}” przestanie być dostępny dla klientów. Tej akcji nie można cofnąć.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Anuluj</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-white hover:bg-destructive/90"
                                    onClick={() => {
                                      deleteDiscountCode(discount.id);
                                      toast.success('Kod rabatowy został usunięty.');
                                    }}
                                  >
                                    Usuń
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                    <ListPagination
                      currentPage={discountsPage}
                      totalPages={discountsTotalPages}
                      onPageChange={setDiscountsPage}
                      itemsPerPage={discountsPerPage}
                      onItemsPerPageChange={setDiscountsPerPage}
                      totalItems={sortedDiscountCodes.length}
                    />
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
