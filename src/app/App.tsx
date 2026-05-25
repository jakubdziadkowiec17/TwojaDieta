import { BrowserRouter, Routes, Route } from 'react-router';
import { ScrollToTop } from './components/ScrollToTop';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { DietsPage } from './pages/DietsPage';
import { DietDetailPage } from './pages/DietDetailPage';
import { CartPage } from './pages/CartPage';
import { AccountPage } from './pages/AccountPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminPage } from './pages/AdminPage';
import { DeliveryPage } from './pages/DeliveryPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { LegalPage } from './pages/LegalPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RequireAdmin, RequireGuest } from './components/ProtectedRoute';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/diety" element={<DietsPage />} />
          <Route path="/diety/:id" element={<DietDetailPage />} />
          <Route path="/koszyk" element={<CartPage />} />
          <Route path="/zamowienie" element={<CheckoutPage />} />
          <Route path="/zamowienie/potwierdzenie/:id" element={<OrderConfirmationPage />} />
          <Route path="/konto" element={<AccountPage />} />
          <Route path="/logowanie" element={<RequireGuest><LoginPage /></RequireGuest>} />
          <Route path="/rejestracja" element={<RequireGuest><RegisterPage /></RequireGuest>} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminPage />
              </RequireAdmin>
            }
          />
          <Route path="/dostawa" element={<DeliveryPage />} />
          <Route path="/reset-hasla" element={<RequireGuest><ResetPasswordPage /></RequireGuest>} />
          <Route path="/regulamin" element={<LegalPage title="Regulamin" />} />
          <Route path="/polityka-prywatnosci" element={<LegalPage title="Polityka prywatności" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
      <Toaster position="top-right" richColors closeButton />
    </BrowserRouter>
  );
}
