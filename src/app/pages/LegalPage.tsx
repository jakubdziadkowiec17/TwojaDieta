import { Link } from 'react-router';
import { Breadcrumbs } from '../components/Breadcrumbs';

const UPDATED_AT = '25.05.2026';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      <div className="text-muted-foreground space-y-3">{children}</div>
    </section>
  );
}

export function LegalPage({ title }: { title: string }) {
  const isTerms = title.toLowerCase().includes('regulamin');
  const isPrivacy = title.toLowerCase().includes('polityka');

  return (
    <div className="container mx-auto max-w-screen-2xl px-8 py-8">
      <Breadcrumbs items={[{ label: 'Strona główna', to: '/' }, { label: title }]} />
      <div className="bg-white border border-border rounded-xl p-6 max-w-3xl">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>

        <p className="text-sm text-muted-foreground">
          Ostatnia aktualizacja: <span className="font-medium">{UPDATED_AT}</span>. Dokument dotyczy wersji demonstracyjnej aplikacji (projekt uczelniany, bez backendu).
        </p>

        {isTerms && (
          <>
            <Section title="1. Informacje ogólne">
              <p>
                Serwis <span className="font-medium text-foreground">TwojaDieta</span> prezentuje ofertę diet oraz umożliwia złożenie zamówienia online.
                W tej wersji aplikacji dane są przechowywane lokalnie w przeglądarce (localStorage) i służą wyłącznie do demonstracji działania.
              </p>
              <p>
                Strona dostawy znajduje się tutaj: <Link to="/dostawa" className="text-primary hover:underline">Dostawa</Link>.
              </p>
            </Section>

            <Section title="2. Definicje">
              <ul className="list-disc pl-6 space-y-2">
                <li><span className="font-medium text-foreground">Użytkownik</span> – osoba korzystająca z serwisu.</li>
                <li><span className="font-medium text-foreground">Klient</span> – użytkownik składający zamówienie.</li>
                <li><span className="font-medium text-foreground">Dieta</span> – gotowy zestaw posiłków dostępny w ofercie.</li>
                <li><span className="font-medium text-foreground">Zamówienie</span> – zestaw wybranych diet wraz z konfiguracją (kcal, liczba dni, data startu) i danymi dostawy.</li>
              </ul>
            </Section>

            <Section title="3. Konto i logowanie">
              <p>
                Założenie konta jest opcjonalne – zamówienie można złożyć również bez logowania. Konto umożliwia wgląd w historię zamówień oraz ocenianie diet.
              </p>
              <p>
                Formularze dostępne są na stronach: <Link to="/logowanie" className="text-primary hover:underline">Logowanie</Link> i{' '}
                <Link to="/rejestracja" className="text-primary hover:underline">Rejestracja</Link>.
              </p>
            </Section>

            <Section title="4. Składanie zamówienia">
              <ul className="list-disc pl-6 space-y-2">
                <li>Wybierz dietę i jej parametry (kaloryczność, liczba dni, data rozpoczęcia).</li>
                <li>Dodaj dietę do koszyka, a następnie przejdź do zamówienia.</li>
                <li>Uzupełnij dane klienta i dostawy oraz wybierz metodę płatności.</li>
              </ul>
              <p>
                Koszyk jest dostępny tutaj: <Link to="/koszyk" className="text-primary hover:underline">Koszyk</Link>.
              </p>
            </Section>

            <Section title="5. Ceny, dostawa i płatności">
              <p>Ceny diet podane są w złotówkach i dotyczą ceny za 1 dzień diety (chyba że wskazano inaczej).</p>
              <p>
                Dostawa realizowana jest lokalnie w obrębie jednego miasta (Kraków). Koszt dostawy jest doliczany w podsumowaniu zamówienia.
              </p>
              <p>
                W projekcie dostępne są metody płatności demo (Karta/BLIK/Przelew) – bez rzeczywistego przetwarzania płatności.
              </p>
            </Section>

            <Section title="6. Reklamacje i zwroty">
              <p>
                W wersji demonstracyjnej aplikacji nie realizujemy rzeczywistych zwrotów ani reklamacji. W docelowym serwisie zasady reklamacji obejmowałyby
                m.in. zgłoszenie w określonym terminie oraz opis problemu.
              </p>
            </Section>

            <Section title="7. Kontakt">
              <p>
                Kontakt (przykładowy): e-mail <span className="font-medium text-foreground">kontakt@catering.pl</span>, tel. <span className="font-medium text-foreground">+48 123 456 789</span>.
              </p>
            </Section>
          </>
        )}

        {isPrivacy && (
          <>
            <Section title="1. Administrator danych">
              <p>
                Administratorem danych w wersji demonstracyjnej jest <span className="font-medium text-foreground">TwojaDieta</span> (projekt uczelniany).
                Aplikacja nie posiada backendu – dane są przechowywane lokalnie w Twojej przeglądarce.
              </p>
            </Section>

            <Section title="2. Jakie dane przetwarzamy">
              <ul className="list-disc pl-6 space-y-2">
                <li>Dane konta: imię, nazwisko, e-mail (oraz opcjonalnie telefon).</li>
                <li>Dane dostawy: adres, miasto, kod pocztowy, uwagi.</li>
                <li>Dane zamówień: wybrane diety, kaloryczność, liczba dni, data rozpoczęcia, suma, status.</li>
                <li>Opinie: ocena i komentarz.</li>
              </ul>
            </Section>

            <Section title="3. Gdzie dane są przechowywane">
              <p>
                Dane są przechowywane w <span className="font-medium text-foreground">localStorage</span> w Twojej przeglądarce (na Twoim urządzeniu).
                Usunięcie danych przeglądarki (np. „Wyczyść dane witryny”) spowoduje usunięcie zapisanych danych aplikacji.
              </p>
            </Section>

            <Section title="4. Cele przetwarzania">
              <ul className="list-disc pl-6 space-y-2">
                <li>utworzenie konta i logowanie,</li>
                <li>realizacja procesu zakupowego (koszyk → zamówienie → potwierdzenie),</li>
                <li>wyświetlanie historii zamówień na koncie,</li>
                <li>umożliwienie wystawiania opinii o dietach.</li>
              </ul>
            </Section>

            <Section title="5. Udostępnianie danych">
              <p>
                W wersji demonstracyjnej aplikacji dane nie są wysyłane na serwer i nie są udostępniane podmiotom trzecim.
              </p>
            </Section>

            <Section title="6. Prawa użytkownika">
              <p>
                Ponieważ dane są przechowywane lokalnie, możesz je modyfikować w aplikacji (np. w zakładce Konto) lub usunąć poprzez wyczyszczenie danych
                przeglądarki dla tej witryny.
              </p>
              <p>
                Konto jest dostępne tutaj: <Link to="/konto" className="text-primary hover:underline">Konto</Link>.
              </p>
            </Section>

            <Section title="7. Pliki cookies i podobne technologie">
              <p>
                Aplikacja może korzystać z mechanizmów przeglądarki (np. localStorage) w celu zapamiętania sesji oraz koszyka.
                W wersji demonstracyjnej nie wdrażamy zewnętrznych narzędzi analitycznych.
              </p>
            </Section>
          </>
        )}

        {!isTerms && !isPrivacy && (
          <p className="text-muted-foreground mt-6">
            Brak przygotowanej treści dla tej strony.
          </p>
        )}
      </div>
    </div>
  );
}
