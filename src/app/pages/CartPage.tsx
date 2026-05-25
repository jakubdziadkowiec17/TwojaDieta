import { Link } from 'react-router';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { DurationSelect } from '../components/DurationSelect';
import { OptionalMark } from '../components/FormFeedback';
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
import { X, Shield, Truck, Leaf } from 'lucide-react';
import { useCart } from '../providers/CartProvider';
import { useData } from '../providers/DataProvider';
import { calculateDiscount } from '../lib/discounts';
import { getVariantPrice } from '../lib/dietVariants';
import { calculateDeliveryCost } from '../lib/pricing';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { toast } from 'sonner';
import { validationLimits } from '../lib/validation';

function formatIsoDate(iso: string): string {
  try {
    return format(new Date(iso), 'dd.MM.yyyy', { locale: pl });
  } catch {
    return iso;
  }
}

export function CartPage() {
  const { items, couponCode, setCouponCode, updateItem, removeItem } = useCart();
  const { getDietById, discountCodes } = useData();

  const cartItems = items
    .map((item) => {
      const diet = getDietById(item.dietId);
      if (!diet) return null;
      return { ...item, diet, pricePerDay: getVariantPrice(diet, item.calories) };
    })
    .filter(Boolean);

  const subtotal = cartItems.reduce((sum, item) => sum + item!.pricePerDay * item!.days, 0);
  const deliveryCost = calculateDeliveryCost(subtotal, cartItems.length);
  const { appliedCode, amount: discountAmount } = calculateDiscount(discountCodes, couponCode, subtotal);
  const total = Math.max(0, subtotal + deliveryCost - discountAmount);

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId);
    toast.success('Usunięto dietę z koszyka.');
  };

  return (
    <div className="container mx-auto max-w-screen-2xl px-8 py-8">
      <Breadcrumbs items={[{ label: 'Strona główna', to: '/' }, { label: 'Koszyk' }]} />

      <h1 className="text-3xl font-bold mb-2">TWÓJ KOSZYK</h1>
      <p className="text-muted-foreground mb-8">Masz {cartItems.length} produkty w koszyku</p>

      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-6">Twój koszyk jest pusty</p>
          <Link
            to="/diety"
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            ← KONTYNUUJ ZAKUPY
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white border border-border rounded-xl overflow-hidden mb-6">
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-secondary font-medium text-sm">
                <div className="col-span-5">PRODUKT</div>
                <div className="col-span-2 text-center">CENA</div>
                <div className="col-span-2 text-center">LICZBA DNI</div>
                <div className="col-span-2 text-center">RAZEM</div>
                <div className="col-span-1"></div>
              </div>

              {cartItems.map((item, index) => (
                <div
                  key={item!.id}
                  className="grid md:grid-cols-12 gap-4 p-4 border-b border-border last:border-b-0"
                >
                  <div className="md:col-span-5 flex gap-4">
                    <img
                      src={item!.diet.image}
                      alt={item!.diet.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-bold mb-1">{item!.diet.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item!.calories} kcal | {item!.days} dni | start: {formatIsoDate(item!.startDate)}
                      </p>
                      <div className="flex gap-4 mt-2">
                        <Link
                          to={`/diety/${item!.diet.id}?cartItemId=${item!.id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          Edytuj
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button type="button" className="text-sm text-primary hover:underline">
                              Usuń
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Usunąć dietę z koszyka?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Pozycja „{item!.diet.name}” zostanie usunięta z Twojego koszyka.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Anuluj</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-white hover:bg-destructive/90"
                                onClick={() => handleRemoveItem(item!.id)}
                              >
                                Usuń
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex items-center md:justify-center">
                    <span className="font-medium">{item!.pricePerDay} zł / dzień</span>
                  </div>

                  <div className="md:col-span-2 flex items-center md:justify-center">
                    <DurationSelect
                      value={item!.days}
                      onChange={(days) => {
                        updateItem(item!.id, { days });
                        toast.success('Zmieniono liczbę dni.');
                      }}
                      className="md:max-w-28"
                    />
                  </div>

                  <div className="md:col-span-2 flex items-center md:justify-center">
                    <span className="font-bold text-primary">
                      {item!.pricePerDay * item!.days} zł
                    </span>
                  </div>

                  <div className="md:col-span-1 flex items-center md:justify-center">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          type="button"
                          className="p-2 hover:bg-destructive/10 text-destructive rounded-lg"
                          aria-label={`Usuń ${item!.diet.name} z koszyka`}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Usunąć dietę z koszyka?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Pozycja „{item!.diet.name}” zostanie usunięta z Twojego koszyka.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Anuluj</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-white hover:bg-destructive/90"
                            onClick={() => handleRemoveItem(item!.id)}
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

            <div className="flex items-start gap-4">
              <Link
                to="/diety"
                className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                ← KONTYNUUJ ZAKUPY
              </Link>

              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium">Kod rabatowy<OptionalMark /></label>
                <input
                  type="text"
                  value={couponCode}
                  maxLength={validationLimits.couponMax}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Wpisz kod rabatowy"
                  className="w-full px-4 py-3 border border-border rounded-lg uppercase"
                />
                {couponCode.trim() && (
                  <p className={`text-xs mt-2 ${appliedCode ? 'text-primary' : 'text-destructive'}`}>
                    {appliedCode ? `Zastosowano kod: ${appliedCode.code}.` : 'Podany kod jest nieprawidłowy lub nieaktywny.'}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white border border-border rounded-xl p-6 sticky top-20">
              <h3 className="font-bold text-lg mb-6">PODSUMOWANIE ZAMÓWIENIA</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Produkty ({cartItems.length})</span>
                  <span className="font-medium">{subtotal} zł</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dostawa</span>
                  <span className="font-medium">{deliveryCost > 0 ? `${deliveryCost} zł` : 'Gratis'}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rabat</span>
                    <span className="font-medium text-primary">- {discountAmount} zł</span>
                  </div>
                )}
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-bold">RAZEM</span>
                  <span className="font-bold text-xl text-primary">{total} zł</span>
                </div>
                <p className="text-xs text-muted-foreground">(w tym VAT)</p>
              </div>

              <Link
                to="/zamowienie"
                className="block w-full py-3 bg-primary text-white text-center rounded-lg hover:bg-primary/90 transition-colors mb-6"
              >
                PRZEJDŹ DALEJ
              </Link>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Truck className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <div className="font-medium">Darmowa dostawa</div>
                    <div className="text-muted-foreground">powyżej 250 zł</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Leaf className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <div className="font-medium">Świeże składniki</div>
                    <div className="text-muted-foreground">każdego dnia</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <div className="font-medium">Bezpieczne płatności</div>
                    <div className="text-muted-foreground">SSL i certyfikaty</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
