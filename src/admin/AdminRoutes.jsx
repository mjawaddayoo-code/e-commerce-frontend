import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminLayout from './AdminLayout';
import AdminLogin from './AdminLogin';

const Dashboard = lazy(() => import('./Dashboard'));
const Products = lazy(() => import('./Products'));
const Categories = lazy(() => import('./Categories'));
const Orders = lazy(() => import('./Orders'));
const Payments = lazy(() => import('./Payments'));
const Customers = lazy(() => import('./Customers'));
const Reviews = lazy(() => import('./Reviews'));
const Coupons = lazy(() => import('./Coupons'));
const Inquiries = lazy(() => import('./Inquiries'));
const Reports = lazy(() => import('./Reports'));
const SettingsPage = lazy(() => import('./Settings'));

function Guard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || !['admin', 'staff'].includes(user.role)) return <Navigate to="/admin/login" replace />;
  return children;
}

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route element={<Guard><AdminLayout /></Guard>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="orders" element={<Orders />} />
        <Route path="payments" element={<Payments />} />
        <Route path="customers" element={<Customers />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="inquiries" element={<Inquiries />} />
        <Route path="delivery" element={<SettingsPage section="delivery" />} />
        <Route path="settings" element={<SettingsPage section="business" />} />
        <Route path="offers" element={<Products offers />} />
        <Route path="reports" element={<Reports />} />
        <Route path="*" element={<p className="py-20 text-center text-slate-500">This section is coming soon.</p>} />
      </Route>
    </Routes>
  );
}
