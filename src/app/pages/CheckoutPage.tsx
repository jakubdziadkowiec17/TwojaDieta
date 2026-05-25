import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { FieldError, OptionalMark, fieldClassName } from "../components/FormFeedback";
import { useAuth } from "../providers/AuthProvider";
import { useCart } from "../providers/CartProvider";
import { useData } from "../providers/DataProvider";
import { calculateDiscount } from "../lib/discounts";
import { getVariantPrice } from "../lib/dietVariants";
import { calculateDeliveryCost } from "../lib/pricing";
import type { CustomerData, DeliveryData, PaymentMethod } from "../types";
import { toast } from "sonner";
import {
  firstError,
  type FieldErrors,
  validateCity,
  validateCouponCode,
  validateEmail,
  validateOptionalText,
  validatePhone,
  validatePostalCode,
  validateRequiredText,
  validationLimits,
} from "../lib/validation";

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
  const { getDietById, createOrder, discountCodes } = useData();

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

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
          pricePerDay: getVariantPrice(diet, i.calories),
          lineTotal: getVariantPrice(diet, i.calories) * i.days,
        };
      })
      .filter(Boolean);
  }, [getDietById, items]);

  const subtotal = enrichedItems.reduce((sum, i) => sum + i!.lineTotal, 0);
  const deliveryCost = calculateDeliveryCost(subtotal, enrichedItems.length);

  const { appliedCode, amount: discountAmount } = useMemo(
    () => calculateDiscount(discountCodes, couponCode, subtotal),
    [couponCode, discountCodes, subtotal],
  );

  const total = Math.max(0, subtotal + deliveryCost - discountAmount);

  if (items.length === 0) {
    return <Navigate to="/koszyk" replace />;
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const nextErrors: FieldErrors = {};
    const firstNameError = validateRequiredText(customer.firstName, "Imię", 2, validationLimits.nameMax);
    const lastNameError = validateRequiredText(customer.lastName, "Nazwisko", 2, validationLimits.nameMax);
    const emailError = validateEmail(customer.email);
    const phoneError = validatePhone(customer.phone);
    const addressError = validateRequiredText(delivery.addressLine1, "Adres", 5, validationLimits.addressMax);
    const cityError = validateCity(delivery.addressCity, true, true);
    const postalCodeError = validatePostalCode(delivery.addressPostalCode);
    const notesError = validateOptionalText(delivery.notes ?? "", "Uwagi", validationLimits.notesMax);
    const couponError = validateCouponCode(couponCode);
    if (firstNameError) nextErrors.firstName = firstNameError;
    if (lastNameError) nextErrors.lastName = lastNameError;
    if (emailError) nextErrors.email = emailError;
    if (phoneError) nextErrors.phone = phoneError;
    if (addressError) nextErrors.addressLine1 = addressError;
    if (cityError) nextErrors.addressCity = cityError;
    if (postalCodeError) nextErrors.addressPostalCode = postalCodeError;
    if (notesError) nextErrors.notes = notesError;
    if (couponError) nextErrors.couponCode = couponError;
    setFieldErrors(nextErrors);
    const validationError = firstError(nextErrors);
    if (validationError) {
      setError("Popraw zaznaczone pola formularza.");
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
        pricePerDay: i!.pricePerDay,
      })),
      customer,
      delivery,
      paymentMethod,
      couponCode: appliedCode?.code ?? "",
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
    toast.success("Zamówienie zostało złożone.", {
      description: `Numer zamówienia: #${order.id}`,
    });
    navigate("/konto?tab=orders", {
      replace: true,
      state: { completedOrderId: order.id },
    });
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
        <form onSubmit={submit} className="lg:col-span-2 space-y-6" noValidate>
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
                  maxLength={validationLimits.nameMax}
                  autoComplete="given-name"
                  onChange={(e) => {
                    setCustomer((c) => ({ ...c, firstName: e.target.value }));
                    setFieldErrors((errors) => ({ ...errors, firstName: "" }));
                  }}
                  aria-invalid={!!fieldErrors.firstName}
                  className={`w-full px-4 py-2 border rounded-lg ${fieldClassName(fieldErrors.firstName)}`}
                />
                <FieldError message={fieldErrors.firstName} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nazwisko</label>
                <input
                  value={customer.lastName}
                  maxLength={validationLimits.nameMax}
                  autoComplete="family-name"
                  onChange={(e) => {
                    setCustomer((c) => ({ ...c, lastName: e.target.value }));
                    setFieldErrors((errors) => ({ ...errors, lastName: "" }));
                  }}
                  aria-invalid={!!fieldErrors.lastName}
                  className={`w-full px-4 py-2 border rounded-lg ${fieldClassName(fieldErrors.lastName)}`}
                />
                <FieldError message={fieldErrors.lastName} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">E-mail</label>
                <input
                  type="email"
                  value={customer.email}
                  maxLength={validationLimits.emailMax}
                  autoComplete="email"
                  onChange={(e) => {
                    setCustomer((c) => ({ ...c, email: e.target.value }));
                    setFieldErrors((errors) => ({ ...errors, email: "" }));
                  }}
                  aria-invalid={!!fieldErrors.email}
                  className={`w-full px-4 py-2 border rounded-lg ${fieldClassName(fieldErrors.email)}`}
                />
                <FieldError message={fieldErrors.email} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Telefon</label>
                <input
                  type="tel"
                  value={customer.phone}
                  maxLength={validationLimits.phoneMax}
                  autoComplete="tel"
                  placeholder="501 234 567"
                  onChange={(e) => {
                    setCustomer((c) => ({ ...c, phone: e.target.value }));
                    setFieldErrors((errors) => ({ ...errors, phone: "" }));
                  }}
                  aria-invalid={!!fieldErrors.phone}
                  className={`w-full px-4 py-2 border rounded-lg ${fieldClassName(fieldErrors.phone)}`}
                />
                <FieldError message={fieldErrors.phone} />
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
                  maxLength={validationLimits.addressMax}
                  autoComplete="street-address"
                  onChange={(e) => {
                    setDelivery((d) => ({ ...d, addressLine1: e.target.value }));
                    setFieldErrors((errors) => ({ ...errors, addressLine1: "" }));
                  }}
                  aria-invalid={!!fieldErrors.addressLine1}
                  className={`w-full px-4 py-2 border rounded-lg ${fieldClassName(fieldErrors.addressLine1)}`}
                  placeholder="Ulica, numer domu/mieszkania"
                />
                <FieldError message={fieldErrors.addressLine1} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Miasto</label>
                <input
                  value={delivery.addressCity}
                  maxLength={validationLimits.cityMax}
                  autoComplete="address-level2"
                  onChange={(e) => {
                    setDelivery((d) => ({ ...d, addressCity: e.target.value }));
                    setFieldErrors((errors) => ({ ...errors, addressCity: "" }));
                  }}
                  aria-invalid={!!fieldErrors.addressCity}
                  className={`w-full px-4 py-2 border rounded-lg ${fieldClassName(fieldErrors.addressCity)}`}
                />
                <FieldError message={fieldErrors.addressCity} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Kod pocztowy</label>
                <input
                  value={delivery.addressPostalCode}
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="postal-code"
                  onChange={(e) => {
                    setDelivery((d) => ({ ...d, addressPostalCode: e.target.value }));
                    setFieldErrors((errors) => ({ ...errors, addressPostalCode: "" }));
                  }}
                  aria-invalid={!!fieldErrors.addressPostalCode}
                  className={`w-full px-4 py-2 border rounded-lg ${fieldClassName(fieldErrors.addressPostalCode)}`}
                  placeholder="00-000"
                />
                <FieldError message={fieldErrors.addressPostalCode} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-2">Uwagi<OptionalMark /></label>
                <textarea
                  value={delivery.notes ?? ""}
                  maxLength={validationLimits.notesMax}
                  onChange={(e) => {
                    setDelivery((d) => ({ ...d, notes: e.target.value }));
                    setFieldErrors((errors) => ({ ...errors, notes: "" }));
                  }}
                  aria-invalid={!!fieldErrors.notes}
                  className={`w-full px-4 py-2 border rounded-lg min-h-[90px] ${fieldClassName(fieldErrors.notes)}`}
                />
                <FieldError message={fieldErrors.notes} />
                <p className="mt-1 text-xs text-muted-foreground">{(delivery.notes ?? "").length}/{validationLimits.notesMax}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-xl p-6">
            <h2 className="font-bold text-lg mb-4">Kod rabatowy <OptionalMark /></h2>
            <div>
              <input
                value={couponCode}
                maxLength={validationLimits.couponMax}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setFieldErrors((errors) => ({ ...errors, couponCode: "" }));
                }}
                aria-invalid={!!fieldErrors.couponCode}
                className={`w-full px-4 py-2 border rounded-lg uppercase ${fieldClassName(fieldErrors.couponCode)}`}
                placeholder="Wpisz kod rabatowy"
              />
            </div>
            <FieldError message={fieldErrors.couponCode} />
            {couponCode.trim() && (
              <p className={`text-xs mt-2 ${appliedCode ? "text-primary" : "text-destructive"}`}>
                {appliedCode ? `Zastosowano kod: ${appliedCode.code}.` : "Podany kod jest nieprawidłowy lub nieaktywny."}
              </p>
            )}
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
