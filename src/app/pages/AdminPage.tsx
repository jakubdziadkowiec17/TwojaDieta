import { useMemo, useState } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ShoppingCart, Users, Calendar, Truck, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../providers/DataProvider';
import { useAuth } from '../providers/AuthProvider';
import type { Diet, OrderStatus } from '../types';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

function formatDateTime(iso: string): string {
  try {
    return format(new Date(iso), 'dd.MM.yyyy HH:mm', { locale: pl });
  } catch {
    return iso;
  }
}

function parseCsvNumbers(value: string): number[] {
  return value
    .split(',')
    .map((v) => parseInt(v.trim()))
    .filter((n) => Number.isFinite(n));
}

function parseCsvStrings(value: string): string[] {
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

export function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { diets, orders, addDiet, updateDiet, deleteDiet, updateOrderStatus } = useData();
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

  const [editingDietId, setEditingDietId] = useState<string | null>(null);
  const editingDiet = editingDietId ? diets.find((d) => d.id === editingDietId) ?? null : null;
  const [dietForm, setDietForm] = useState(() => ({
    name: '',
    shortDescription: '',
    description: '',
    image: '',
    images: '',
    pricePerDay: '59',
    calorieOptions: '1500, 2000',
    goal: 'Zdrowe odżywianie',
    tags: 'Zdrowe odżywianie',
    allergens: '',
    sampleMenu: '',
  }));

  const loadDietToForm = (diet: Diet) => {
    setDietForm({
      name: diet.name,
      shortDescription: diet.shortDescription,
      description: diet.description,
      image: diet.image,
      images: diet.images.join(', '),
      pricePerDay: String(diet.pricePerDay),
      calorieOptions: diet.calorieOptions.join(', '),
      goal: diet.goal ?? '',
      tags: diet.tags.join(', '),
      allergens: diet.allergens.join(', '),
      sampleMenu: diet.sampleMenu.join('\n'),
    });
  };

  const resetDietForm = () => {
    setEditingDietId(null);
    setDietForm({
      name: '',
      shortDescription: '',
      description: '',
      image: '',
      images: '',
      pricePerDay: '59',
      calorieOptions: '1500, 2000',
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
                    {diets.slice(0, 5).map((diet, index) => (
                      <div key={diet.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-muted-foreground">
                            {index + 1}
                          </span>
                          <span className="font-medium">{diet.name}</span>
                        </div>
                        <span className="text-primary font-bold">
                          {orders.filter((o) => o.items.some((it) => it.dietId === diet.id)).length} zamówień
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">OSTATNIE ZAMÓWIENIA</h3>
                  <button className="text-sm text-primary hover:underline">
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
                      {orders.slice(0, 8).map((order) => (
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
                            <button className="text-primary hover:underline text-sm" onClick={() => setActiveTab('orders')}>Szczegóły</button>
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
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-border rounded-xl p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <div className="font-bold">#{order.id} • {order.customer.firstName} {order.customer.lastName}</div>
                            <div className="text-sm text-muted-foreground">{formatDateTime(order.createdAt)} • {order.customer.email}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="font-bold text-primary">{order.total} zł</div>
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                              className="px-3 py-2 border border-border rounded-lg"
                            >
                              {(['Nowe', 'W trakcie', 'Dostarczone', 'Anulowane'] as OrderStatus[]).map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="mt-3 text-sm">
                          <div className="text-muted-foreground">Dostawa: {order.delivery.addressLine1}, {order.delivery.addressPostalCode} {order.delivery.addressCity}</div>
                          <div className="mt-2 space-y-1">
                            {order.items.map((it, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span>{it.dietName} • {it.calories} kcal • {it.days} dni • start: {it.startDate}</span>
                                <span className="font-medium">{it.pricePerDay * it.days} zł</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
                    {diets.map((d) => (
                      <div key={d.id} className="flex items-center justify-between border border-border rounded-lg p-3">
                        <div>
                          <div className="font-medium">{d.name}</div>
                          <div className="text-sm text-muted-foreground">{d.pricePerDay} zł/dzień • {d.goal ?? '-'}</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="px-3 py-2 border border-border rounded-lg hover:bg-secondary"
                            onClick={() => {
                              setEditingDietId(d.id);
                              loadDietToForm(d);
                            }}
                          >
                            Edytuj
                          </button>
                          <button
                            type="button"
                            className="px-3 py-2 border border-border rounded-lg hover:bg-destructive/10 text-destructive"
                            onClick={() => {
                              if (confirm(`Usunąć dietę: ${d.name}?`)) {
                                deleteDiet(d.id);
                                if (editingDietId === d.id) resetDietForm();
                              }
                            }}
                          >
                            Usuń
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-border rounded-xl p-6">
                  <h3 className="font-bold mb-4">{editingDiet ? 'Edycja diety' : 'Dodaj dietę'}</h3>
                  <form
                    className="space-y-4"
                    onSubmit={(e) => {
                      e.preventDefault();

                      const price = parseInt(dietForm.pricePerDay);
                      const calories = parseCsvNumbers(dietForm.calorieOptions);
                      if (!dietForm.name.trim() || !dietForm.shortDescription.trim() || !dietForm.description.trim()) return;
                      if (!Number.isFinite(price) || calories.length === 0) return;

                      const dietPayload = {
                        name: dietForm.name.trim(),
                        shortDescription: dietForm.shortDescription.trim(),
                        description: dietForm.description.trim(),
                        image: dietForm.image.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
                        images: parseCsvStrings(dietForm.images).length ? parseCsvStrings(dietForm.images) : [dietForm.image.trim()].filter(Boolean),
                        calorieOptions: calories,
                        pricePerDay: price,
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
                      } else {
                        addDiet(dietPayload);
                      }
                      resetDietForm();
                    }}
                  >
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Nazwa</label>
                        <input value={dietForm.name} onChange={(e) => setDietForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2 border border-border rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Cena / dzień (zł)</label>
                        <input value={dietForm.pricePerDay} onChange={(e) => setDietForm((f) => ({ ...f, pricePerDay: e.target.value }))} className="w-full px-4 py-2 border border-border rounded-lg" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-2">Krótki opis</label>
                        <input value={dietForm.shortDescription} onChange={(e) => setDietForm((f) => ({ ...f, shortDescription: e.target.value }))} className="w-full px-4 py-2 border border-border rounded-lg" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-2">Opis</label>
                        <textarea value={dietForm.description} onChange={(e) => setDietForm((f) => ({ ...f, description: e.target.value }))} className="w-full px-4 py-2 border border-border rounded-lg min-h-[120px]" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-2">URL zdjęcia (miniatura)</label>
                        <input value={dietForm.image} onChange={(e) => setDietForm((f) => ({ ...f, image: e.target.value }))} className="w-full px-4 py-2 border border-border rounded-lg" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-2">URL zdjęć (CSV)</label>
                        <input value={dietForm.images} onChange={(e) => setDietForm((f) => ({ ...f, images: e.target.value }))} className="w-full px-4 py-2 border border-border rounded-lg" placeholder="url1, url2, url3" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Kaloryczności (CSV)</label>
                        <input value={dietForm.calorieOptions} onChange={(e) => setDietForm((f) => ({ ...f, calorieOptions: e.target.value }))} className="w-full px-4 py-2 border border-border rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Cel</label>
                        <input value={dietForm.goal} onChange={(e) => setDietForm((f) => ({ ...f, goal: e.target.value }))} className="w-full px-4 py-2 border border-border rounded-lg" placeholder="Utrata wagi / Budowa masy mięśniowej / Zdrowe odżywianie" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-2">Tagi / preferencje (CSV)</label>
                        <input value={dietForm.tags} onChange={(e) => setDietForm((f) => ({ ...f, tags: e.target.value }))} className="w-full px-4 py-2 border border-border rounded-lg" placeholder="Wegetariańska, Keto, Bezglutenowa..." />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-2">Alergeny (CSV)</label>
                        <input value={dietForm.allergens} onChange={(e) => setDietForm((f) => ({ ...f, allergens: e.target.value }))} className="w-full px-4 py-2 border border-border rounded-lg" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-2">Przykładowe menu (1 linia = 1 pozycja)</label>
                        <textarea value={dietForm.sampleMenu} onChange={(e) => setDietForm((f) => ({ ...f, sampleMenu: e.target.value }))} className="w-full px-4 py-2 border border-border rounded-lg min-h-[140px]" />
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
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-border last:border-b-0">
                          <td className="px-4 py-3">{u.email}</td>
                          <td className="px-4 py-3">{u.profile.firstName} {u.profile.lastName}</td>
                          <td className="px-4 py-3">{u.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'deliveries' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Dostawy</h2>
              <div className="bg-white border border-border rounded-xl p-6">
                <p className="text-muted-foreground">
                  W wersji bez backendu traktujemy dostawy jako część zamówienia (adres w zamówieniu).
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
