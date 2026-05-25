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
import { RequireAdmin } from './components/ProtectedRoute';

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
          <Route path="/logowanie" element={<LoginPage />} />
          <Route path="/rejestracja" element={<RegisterPage />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminPage />
              </RequireAdmin>
            }
          />
          <Route path="/dostawa" element={<DeliveryPage />} />
          <Route path="/reset-hasla" element={<ResetPasswordPage />} />
          <Route path="/regulamin" element={<LegalPage title="Regulamin" />} />
          <Route path="/polityka-prywatnosci" element={<LegalPage title="Polityka prywatności" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}