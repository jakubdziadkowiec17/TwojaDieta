import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { useAuth } from "../providers/AuthProvider";
import { useCart } from "../providers/CartProvider";
import { useData } from "../providers/DataProvider";
import type { CustomerData, DeliveryData, PaymentMethod } from "../types";

function formatIsoDate(iso: string): string {
  try {
    return format(new Date(iso), "dd.MM.yyyy", { locale: pl });
  } catch {
    return iso;
  }
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile } = useAuth();
  const { items, couponCode, setCouponCode, clearCart } = useCart();
  const { getDietById, createOrder } = useData();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Karta");
  const [customer, setCustomer] = useState<CustomerData>(() => ({
    firstName: user?.profile.firstName ?? "",
    lastName: user?.profile.lastName ?? "",
    email: user?.email ?? "",
    phone: user?.profile.phone ?? "",
  }));
  const [delivery, setDelivery] = useState<DeliveryData>(() => ({
    addressLine1: user?.profile.addressLine1 ?? "",
    addressCity: user?.profile.addressCity ?? "Kraków",
    addressPostalCode: user?.profile.addressPostalCode ?? "",
    notes: "",
  }));
  const [error, setError] = useState<string | null>(null);

  const enrichedItems = useMemo(() => {
    return items
      .map((i) => {
        const diet = getDietById(i.dietId);
        if (!diet) return null;
        return {
          cartItemId: i.id,
          diet,
          calories: i.calories,
          days: i.days,
          startDate: i.startDate,
          lineTotal: diet.pricePerDay * i.days,
        };
      })
      .filter(Boolean);
  }, [getDietById, items]);

  const subtotal = enrichedItems.reduce((sum, i) => sum + i!.lineTotal, 0);
  const deliveryCost = subtotal >= 250 ? 0 : enrichedItems.length > 0 ? 15 : 0;

  const discountAmount = useMemo(() => {
    // Demo codes
    const code = couponCode.trim().toUpperCase();
    if (code === "TPF10") return Math.round(subtotal * 0.1);
    if (code === "DOSTAWA") return deliveryCost;
    return 0;
  }, [couponCode, deliveryCost, subtotal]);

  const total = Math.max(0, subtotal + deliveryCost - discountAmount);

  if (items.length === 0) {
    return <Navigate to="/koszyk" replace />;
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customer.firstName.trim() || !customer.lastName.trim()) {
      setError("Podaj imię i nazwisko.");
      return;
    }
    if (!customer.email.trim()) {
      setError("Podaj e-mail.");
      return;
    }
    if (!customer.phone.trim()) {
      setError("Podaj numer telefonu.");
      return;
    }
    if (!delivery.addressLine1.trim() || !delivery.addressCity.trim() || !delivery.addressPostalCode.trim()) {
      setError("Uzupełnij dane dostawy.");
      return;
    }

    const order = createOrder({
      userId: isAuthenticated ? user!.id : null,
      items: enrichedItems.map((i) => ({
        dietId: i!.diet.id,
        dietName: i!.diet.name,
        calories: i!.calories,
        days: i!.days,
        startDate: i!.startDate,
        pricePerDay: i!.diet.pricePerDay,
      })),
      customer,
      delivery,
      paymentMethod,
      couponCode,
      discountAmount,
      subtotal,
      deliveryCost,
      total,
    });

    if (isAuthenticated) {
      updateProfile({
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        addressLine1: delivery.addressLine1,
        addressCity: delivery.addressCity,
        addressPostalCode: delivery.addressPostalCode,
      });
    }

    clearCart();
    navigate(isAuthenticated ? "/konto?tab=orders" : `/zamowienie/potwierdzenie/${order.id}`, { replace: true });
  };

  return (
    <div className="container mx-auto max-w-screen-2xl px-8 py-8">
      <Breadcrumbs
        items={[
          { label: "Strona główna", to: "/" },
          { label: "Koszyk", to: "/koszyk" },
          { label: "Zamówienie" },
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">ZAMÓWIENIE</h1>
        {!isAuthenticated && (
          <div className="text-sm text-muted-foreground">
            Masz konto? <Link to="/logowanie" className="text-primary hover:underline">Zaloguj się</Link> i miej historię zamówień.
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <form onSubmit={submit} className="lg:col-span-2 space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-xl p-4">{error}</div>
          )}

          <div className="bg-white border border-border rounded-xl p-6">
            <h2 className="font-bold text-lg mb-4">Dane klienta</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Imię</label>
                <input
                  value={customer.firstName}
                  onChange={(e) => setCustomer((c) => ({ ...c, firstName: e.target.value }))}
                  className="w-full px-4 py-2 border border-border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nazwisko</label>
                <input
                  value={customer.lastName}
                  onChange={(e) => setCustomer((c) => ({ ...c, lastName: e.target.value }))}
                  className="w-full px-4 py-2 border border-border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">E-mail</label>
                <input
                  type="email"
                  value={customer.email}
                  onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Telefon</label>
                <input
                  value={customer.phone}
                  onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))}
                  className="w-full px-4 py-2 border border-border rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-xl p-6">
            <h2 className="font-bold text-lg mb-4">Dane dostawy</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-2">Adres</label>
                <input
                  value={delivery.addressLine1}
                  onChange={(e) => setDelivery((d) => ({ ...d, addressLine1: e.target.value }))}
                  className="w-full px-4 py-2 border border-border rounded-lg"
                  placeholder="Ulica, numer domu/mieszkania"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Miasto</label>
                <input
                  value={delivery.addressCity}
                  onChange={(e) => setDelivery((d) => ({ ...d, addressCity: e.target.value }))}
                  className="w-full px-4 py-2 border border-border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Kod pocztowy</label>
                <input
                  value={delivery.addressPostalCode}
                  onChange={(e) => setDelivery((d) => ({ ...d, addressPostalCode: e.target.value }))}
                  className="w-full px-4 py-2 border border-border rounded-lg"
                  placeholder="00-000"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-2">Uwagi (opcjonalnie)</label>
                <textarea
                  value={delivery.notes ?? ""}
                  onChange={(e) => setDelivery((d) => ({ ...d, notes: e.target.value }))}
                  className="w-full px-4 py-2 border border-border rounded-lg min-h-[90px]"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-xl p-6">
            <h2 className="font-bold text-lg mb-4">Kod rabatowy</h2>
            <div className="flex gap-2">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 px-4 py-2 border border-border rounded-lg"
                placeholder="np. TPF10 lub DOSTAWA"
              />
              <button type="button" className="px-4 py-2 bg-secondary border border-border rounded-lg">
                Zastosuj
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Demo: `TPF10` (-10%) lub `DOSTAWA` (-koszt dostawy).</p>
          </div>

          <div className="bg-white border border-border rounded-xl p-6">
            <h2 className="font-bold text-lg mb-4">Płatność</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {(["Karta", "BLIK", "Przelew"] as PaymentMethod[]).map((m) => (
                <label key={m} className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer ${paymentMethod === m ? "border-primary" : "border-border"}`}>
                  <input type="radio" name="payment" checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} />
                  <span className="font-medium">{m}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            ZAMÓW
          </button>
        </form>

        <aside>
          <div className="bg-white border border-border rounded-xl p-6 sticky top-20">
            <h2 className="font-bold text-lg mb-4">Podsumowanie</h2>
            <div className="space-y-3 mb-6">
              {enrichedItems.map((i) => (
                <div key={i!.cartItemId} className="flex justify-between gap-4">
                  <div className="text-sm">
                    <div className="font-medium">{i!.diet.name}</div>
                    <div className="text-muted-foreground">
                      {i!.calories} kcal • {i!.days} dni • start: {formatIsoDate(i!.startDate)}
                    </div>
                  </div>
                  <div className="font-medium">{i!.lineTotal} zł</div>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Suma</span><span>{subtotal} zł</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Dostawa</span><span>{deliveryCost === 0 ? "Gratis" : `${deliveryCost} zł`}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Rabat</span><span>{discountAmount > 0 ? `- ${discountAmount} zł` : "0 zł"}</span></div>
              <div className="border-t border-border pt-2 flex justify-between font-bold">
                <span>Razem</span><span className="text-primary">{total} zł</span>
              </div>
            </div>

            <Link to="/koszyk" className="block text-center mt-6 text-sm text-primary hover:underline">
              ← Wróć do koszyka
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
