export type FieldErrors = Record<string, string>;

export const validationLimits = {
  nameMax: 50,
  emailMax: 120,
  passwordMax: 72,
  phoneMax: 16,
  addressMax: 100,
  cityMax: 50,
  notesMax: 300,
  reviewMax: 500,
  dietNameMax: 60,
  shortDescriptionMax: 120,
  descriptionMax: 1000,
  csvMax: 500,
  menuMax: 1000,
  couponMax: 20,
} as const;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const polishPostalCodePattern = /^\d{2}-\d{3}$/;
const couponPattern = /^[A-Z0-9_-]{3,20}$/;
const urlPattern = /^https?:\/\/\S+$/i;

export function validateRequiredText(value: string, label: string, minLength = 2, maxLength = 100): string | undefined {
  const normalized = value.trim();
  if (!normalized) return `Pole „${label}” jest wymagane.`;
  if (normalized.length < minLength) return `${label} musi mieć co najmniej ${minLength} znaki.`;
  if (normalized.length > maxLength) return `${label} może mieć maksymalnie ${maxLength} znaków.`;
  return undefined;
}

export function validateOptionalText(value: string, label: string, maxLength: number): string | undefined {
  if (value.trim().length > maxLength) return `${label} może mieć maksymalnie ${maxLength} znaków.`;
  return undefined;
}

export function validateEmail(value: string): string | undefined {
  const normalized = value.trim();
  if (!normalized) return 'Adres e-mail jest wymagany.';
  if (normalized.length > validationLimits.emailMax) return `Adres e-mail może mieć maksymalnie ${validationLimits.emailMax} znaków.`;
  if (!emailPattern.test(normalized)) return 'Podaj poprawny adres e-mail, np. anna@example.com.';
  return undefined;
}

export function validatePassword(value: string, label = 'Hasło'): string | undefined {
  if (!value) return `${label} jest wymagane.`;
  if (value.length < 8) return `${label} musi mieć co najmniej 8 znaków.`;
  if (value.length > validationLimits.passwordMax) return `${label} może mieć maksymalnie ${validationLimits.passwordMax} znaki.`;
  if (!/[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]/.test(value) || !/\d/.test(value)) {
    return `${label} musi zawierać literę i cyfrę.`;
  }
  return undefined;
}

export function validateLoginPassword(value: string): string | undefined {
  if (!value) return 'Hasło jest wymagane.';
  if (value.length > validationLimits.passwordMax) return `Hasło może mieć maksymalnie ${validationLimits.passwordMax} znaki.`;
  return undefined;
}

export function validatePhone(value: string, required = true): string | undefined {
  const normalized = value.trim();
  if (!normalized) return required ? 'Numer telefonu jest wymagany.' : undefined;
  const digits = normalized.replace(/\D/g, '');
  if (!/^(\+?48)?[\d\s-]{9,}$/.test(normalized) || ![9, 11].includes(digits.length)) {
    return 'Podaj poprawny numer telefonu, np. 501 234 567.';
  }
  return undefined;
}

export function validatePostalCode(value: string, required = true): string | undefined {
  const normalized = value.trim();
  if (!normalized) return required ? 'Kod pocztowy jest wymagany.' : undefined;
  if (!polishPostalCodePattern.test(normalized)) return 'Podaj kod pocztowy w formacie 00-000.';
  return undefined;
}

export function validateCity(value: string, required = true, onlyKrakow = false): string | undefined {
  const normalized = value.trim();
  if (!normalized) return required ? 'Miasto jest wymagane.' : undefined;
  if (normalized.length > validationLimits.cityMax) return `Miasto może mieć maksymalnie ${validationLimits.cityMax} znaków.`;
  if (!/^[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż -]+$/.test(normalized)) return 'Podaj poprawną nazwę miasta.';
  if (onlyKrakow && !['kraków', 'krakow'].includes(normalized.toLocaleLowerCase('pl-PL'))) {
    return 'Dostawy realizujemy wyłącznie na terenie Krakowa.';
  }
  return undefined;
}

export function validateCouponCode(value: string, required = false): string | undefined {
  const normalized = value.trim().toUpperCase();
  if (!normalized) return required ? 'Kod rabatowy jest wymagany.' : undefined;
  if (!couponPattern.test(normalized)) return 'Kod może zawierać 3-20 znaków: litery, cyfry, _ lub -.';
  return undefined;
}

export function validateOptionalUrl(value: string, label: string): string | undefined {
  const normalized = value.trim();
  if (!normalized) return undefined;
  if (!urlPattern.test(normalized)) return `${label} musi zaczynać się od http:// lub https://.`;
  return undefined;
}

export function validateOptionalUrlList(value: string): string | undefined {
  const urls = value.split(',').map((item) => item.trim()).filter(Boolean);
  for (const url of urls) {
    if (!urlPattern.test(url)) return 'Każdy URL zdjęcia musi zaczynać się od http:// lub https://.';
  }
  return undefined;
}

export function validateDietVariants(value: string): string | undefined {
  const entries = value.split(',').map((item) => item.trim()).filter(Boolean);
  if (entries.length === 0) return 'Podaj co najmniej jeden wariant, np. 1500:69.';
  for (const entry of entries) {
    if (!/^\d{3,4}:\d+(?:\.\d{1,2})?$/.test(entry)) {
      return 'Każdy wariant podaj w formacie kalorie:cena, np. 1500:69.';
    }
    const [caloriesText, priceText] = entry.split(':');
    const calories = Number(caloriesText);
    const price = Number(priceText);
    if (calories < 1000 || calories > 4000) return 'Kaloryczność wariantu musi być w zakresie 1000-4000 kcal.';
    if (price <= 0 || price > 500) return 'Cena wariantu musi być większa od 0 i nie większa niż 500 zł.';
  }
  return undefined;
}

export function firstError(errors: FieldErrors): string | null {
  return Object.values(errors)[0] ?? null;
}
