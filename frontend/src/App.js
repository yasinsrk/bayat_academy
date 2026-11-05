import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar';
import ParticleBackground from './components/ParticleBackground';
import CartSidebar from './components/CartSidebar';
import { CartProvider } from './context/CartContext';
import useTokenExpiry from './hooks/useTokenExpiry';

// Pages
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Register from './pages/Register';
import PackageDetail from './pages/PackageDetail';
import VideoPlayer from './pages/VideoPlayer';
import Checkout from './pages/Checkout';
import PackagesPage from './pages/PackagesPage';
import MyPackages from './pages/MyPackages';
import Profile from './pages/Profile';
import PaymentVerify from './pages/PaymentVerify';
import UserTickets from './pages/UserTickets';
import UserTicketCreate from './pages/UserTicketCreate';
import TicketDetail from './pages/TicketDetail';
import ForgotPassword from './pages/ForgotPassword';
import VerifyPhone from './pages/VerifyPhone';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPackages from './pages/admin/AdminPackages';
import AdminPackageForm from './pages/admin/AdminPackageForm';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminPayments from './pages/admin/AdminPayments';
import AdminSettings from './pages/admin/AdminSettings';
import AdminTickets from './pages/admin/AdminTickets';
import AdminAudit from './pages/admin/AdminAudit';
import AdminTicketDetail from './pages/admin/AdminTicketDetail';

// ===== کامپوننت برای شرط نمایش =====
function AppContent() {
  const location = useLocation();
  useTokenExpiry();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAdminLoginRoute = location.pathname === '/admin';

  // فقط در صفحه‌های Login و Register
  const showParticle = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div>
      {!isAdminRoute && !isAdminLoginRoute && (
        <>
          {showParticle && <ParticleBackground />}
          <Navbar />
          <CartSidebar />
        </>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <Routes>
        {/* ===== Public Routes ===== */}
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-phone" element={<VerifyPhone />} />

        {/* ===== Package Routes ===== */}
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/package/:id" element={<PackageDetail />} />

        {/* ===== Video & Payment ===== */}
        <Route path="/watch/:videoId" element={<VideoPlayer />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment/verify" element={<PaymentVerify />} />
        <Route path="/payment/success" element={<PaymentVerify />} />

        {/* ===== User Routes ===== */}
        <Route path="/my-packages" element={<MyPackages />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-tickets" element={<UserTickets />} />
        <Route path="/tickets/create" element={<UserTicketCreate />} />
        <Route path="/tickets/:id" element={<TicketDetail />} />

        {/* ===== Admin Routes ===== */}
        <Route path="/adminpanel/m1/login" element={<AdminLogin />} />
        <Route path="/adminpanel/m1/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/adminpanel/m1/admin/packages" element={<AdminPackages />} />
        <Route path="/adminpanel/m1/admin/packages/add" element={<AdminPackageForm />} />
        <Route path="/adminpanel/m1/admin/packages/:id/edit" element={<AdminPackageForm />} />
        <Route path="/adminpanel/m1/admin/categories" element={<AdminCategories />} />
        <Route path="/adminpanel/m1/admin/payments" element={<AdminPayments />} />
        <Route path="/adminpanel/m1/admin/users" element={<AdminUsers />} />
        <Route path="/adminpanel/m1/admin/settings" element={<AdminSettings />} />
        <Route path="/adminpanel/m1/admin/tickets" element={<AdminTickets />} />
        <Route path="/adminpanel/m1/admin/tickets/:id" element={<AdminTicketDetail />} />
        <Route path="/adminpanel/m1/admin/audit" element={<AdminAudit />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <Router>
        <AppContent />
      </Router>
    </CartProvider>
  );
}

export default App;