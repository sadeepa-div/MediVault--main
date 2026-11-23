import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { LayoutDashboard, ShoppingBag, Pill, Boxes, MessageSquare, UserCircle, Bell, BadgeCheck, Users as UsersIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DashboardLayout from './components/DashboardLayout';
import { Spinner } from './components/ui';
import Home from './pages/Home';
import Medicines from './pages/Medicines';
import MedicineDetail from './pages/MedicineDetail';
import Pharmacies from './pages/Pharmacies';
import PharmacyDetail from './pages/PharmacyDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterPharmacy from './pages/RegisterPharmacy';
import Notifications from './pages/Notifications';
import OwnerDashboard from './pages/owner/Dashboard';
import OwnerOrders from './pages/owner/Orders';
import OwnerMedicines from './pages/owner/Medicines';
import Inventory from './pages/owner/Inventory';
import OwnerFeedback from './pages/owner/Feedback';
import OwnerProfile from './pages/owner/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import Approvals from './pages/admin/Approvals';
import Users from './pages/admin/Users';

const OWNER_LINKS = [
  { to: '/owner', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/owner/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/owner/medicines', label: 'Medicines', icon: Pill },
  { to: '/owner/inventory', label: 'Inventory', icon: Boxes },
  { to: '/owner/feedback', label: 'Feedback', icon: MessageSquare },
  { to: '/owner/notifications', label: 'Notifications', icon: Bell },
  { to: '/owner/profile', label: 'Profile', icon: UserCircle },
];
const ADMIN_LINKS = [
  { to: '/admin', label: 'Sales analysis', icon: LayoutDashboard, end: true },
  { to: '/admin/approvals', label: 'Owner approvals', icon: BadgeCheck },
  { to: '/admin/users', label: 'Users', icon: UsersIcon },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
];

function Shop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (<><Navbar /><main><Outlet /></main><Footer /></>);
}

function RequireRole({ role, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function Toast() {
  const { toast } = useAuth();
  if (!toast) return null;
  return <div key={toast.id} className={`toast ${toast.type}`}>{toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}{toast.message}</div>;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<Shop />}>
          <Route path="/" element={<Home />} />
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/medicines/:id" element={<MedicineDetail />} />
          <Route path="/pharmacies" element={<Pharmacies />} />
          <Route path="/pharmacies/:id" element={<PharmacyDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<RequireRole role="customer"><Checkout /></RequireRole>} />
          <Route path="/orders" element={<RequireRole role="customer"><Orders /></RequireRole>} />
          <Route path="/orders/:id" element={<RequireRole role="customer"><OrderDetail /></RequireRole>} />
          <Route path="/notifications" element={<RequireRole><div className="container page narrow"><Notifications /></div></RequireRole>} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-pharmacy" element={<RegisterPharmacy />} />
        <Route path="/owner" element={<RequireRole role="owner"><DashboardLayout links={OWNER_LINKS} title="Pharmacy owner" /></RequireRole>}>
          <Route index element={<OwnerDashboard />} />
          <Route path="orders" element={<OwnerOrders />} />
          <Route path="medicines" element={<OwnerMedicines />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="feedback" element={<OwnerFeedback />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<OwnerProfile />} />
        </Route>
        <Route path="/admin" element={<RequireRole role="admin"><DashboardLayout links={ADMIN_LINKS} title="Administrator" /></RequireRole>}>
          <Route index element={<AdminDashboard />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="users" element={<Users />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast />
    </>
  );
}
