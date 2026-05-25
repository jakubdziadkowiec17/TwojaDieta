import { Link, useParams } from "react-router";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { useData } from "../providers/DataProvider";

function formatDateTime(iso: string): string {
  try {
    return format(new Date(iso), "dd.MM.yyyy HH:mm", { locale: pl });
  } catch {
    return iso;
  }
}

export function OrderConfirmationPage() {
  const { id } = useParams();
  const { orders } = useData();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="container mx-auto max-w-screen-2xl px-8 py-8">
        <Breadcrumbs items={[{ label: "Strona główna", to: "/" }, { label: "Zamówienie" }]} />
        <h1 className="text-3xl font-bold mb-4">Nie znaleziono zamówienia</h1>
        <Link to="/" className="text-primary hover:underline">Wróć na stronę główną</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-screen-2xl px-8 py-8">
      <Breadcrumbs
        items={[
          { label: "Strona główna", to: "/" },
          { label: "Zamówienie", to: "/zamowienie" },
          { label: "Potwierdzenie" },
        ]}
      />

      <div className="bg-white border border-border rounded-xl p-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Dziękujemy za zamówienie!</h1>
        <p className="text-muted-foreground mb-6">Numer zamówienia: <span className="font-medium text-foreground">#{order.id}</span></p>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <h2 className="font-bold mb-2">Dane</h2>
            <div className="text-sm text-muted-foreground">{order.customer.firstName} {order.customer.lastName}</div>
            <div className="text-sm text-muted-foreground">{order.customer.email}</div>
            <div className="text-sm text-muted-foreground">{order.customer.phone}</div>
          </div>
          <div>
            <h2 className="font-bold mb-2">Dostawa</h2>
            <div className="text-sm text-muted-foreground">{order.delivery.addressLine1}</div>
            <div className="text-sm text-muted-foreground">{order.delivery.addressPostalCode} {order.delivery.addressCity}</div>
            <div className="text-sm text-muted-foreground">Utworzono: {formatDateTime(order.createdAt)}</div>
          </div>
        </div>

        <div className="border-t border-border mt-6 pt-6">
          <h2 className="font-bold mb-3">Podsumowanie</h2>
          <div className="space-y-2 text-sm">
            {order.items.map((i, idx) => (
              <div key={idx} className="flex justify-between">
                <span>{i.dietName} • {i.calories} kcal • {i.days} dni</span>
                <span className="font-medium">{i.pricePerDay * i.days} zł</span>
              </div>
            ))}
            <div className="flex justify-between text-muted-foreground"><span>Suma</span><span>{order.subtotal} zł</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Dostawa</span><span>{order.deliveryCost === 0 ? "Gratis" : `${order.deliveryCost} zł`}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Rabat</span><span>{order.discountAmount > 0 ? `- ${order.discountAmount} zł` : "0 zł"}</span></div>
            <div className="flex justify-between font-bold border-t border-border pt-2"><span>Razem</span><span className="text-primary">{order.total} zł</span></div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-8">
          <Link to="/diety" className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">Wróć do oferty</Link>
          <Link to="/logowanie" className="px-6 py-3 border border-border rounded-lg hover:bg-secondary transition-colors">Zaloguj się</Link>
        </div>
      </div>
    </div>
  );
}
