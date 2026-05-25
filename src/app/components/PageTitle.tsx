import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router';
import { useData } from '../providers/DataProvider';

const BRAND = 'TwojaDieta';

function withBrand(pageTitle: string | null | undefined): string {
  if (!pageTitle) return BRAND;
  return `${pageTitle} - ${BRAND}`;
}

export function PageTitle() {
  const location = useLocation();
  const { getDietById } = useData();

  const title = useMemo(() => {
    const path = location.pathname;

    if (path === '/') return withBrand('Strona główna');
    if (path === '/diety') return withBrand('Diety');
    if (path === '/dostawa') return withBrand('Dostawa');
    if (path === '/koszyk') return withBrand('Koszyk');
    if (path === '/zamowienie') return withBrand('Zamówienie');
    if (path === '/konto') return withBrand('Konto');
    if (path === '/logowanie') return withBrand('Logowanie');
    if (path === '/rejestracja') return withBrand('Rejestracja');
    if (path === '/admin') return withBrand('Panel administratora');
    if (path === '/reset-hasla') return withBrand('Reset hasła');
    if (path === '/regulamin') return withBrand('Regulamin');
    if (path === '/polityka-prywatnosci') return withBrand('Polityka prywatności');

    const dietMatch = path.match(/^\/diety\/([^/]+)$/);
    if (dietMatch) {
      const dietId = decodeURIComponent(dietMatch[1]);
      const diet = getDietById(dietId);
      return withBrand(diet ? `Dieta: ${diet.name}` : 'Dieta');
    }

    const orderMatch = path.match(/^\/zamowienie\/potwierdzenie\/([^/]+)$/);
    if (orderMatch) {
      const orderId = decodeURIComponent(orderMatch[1]);
      return withBrand(`Potwierdzenie zamówienia #${orderId}`);
    }

    return BRAND;
  }, [getDietById, location.pathname]);

  useEffect(() => {
    document.title = title;
  }, [title]);

  return null;
}
