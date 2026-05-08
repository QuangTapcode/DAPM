// src/routes/AppRouter.jsx
// Người 1 sở hữu file này
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Layouts
import GuestLayout from '../components/layout/GuestLayout';
import UserLayout from '../components/layout/UserLayout';
import AdminLayout from '../components/layout/AdminLayout';

// Guest Pages
import HomePage from '../pages/guest/HomePage';
import GuidePage from '../pages/guest/GuidePage';
import LoginPage from '../pages/guest/LoginPage';
import RegisterPage from '../pages/guest/RegisterPage';

// Admin Pages
import AccountList from '../pages/admin/AccountList';
import RoleManagement from '../pages/admin/RoleManagement';

// Sender Pages
import SenderDashboard from '../pages/sender/SenderDashboard';
import CreateChildRequest from '../pages/sender/CreateChildRequest';
import RequestStatus from '../pages/sender/RequestStatus';

// Adopter Pages
import AdopterDashboard from '../pages/adopter/AdopterDashboard';
import CreateAdoptionRequest from '../pages/adopter/CreateAdoptionRequest';
import ChildrenList from '../pages/adopter/ChildrenList';

// Staff Reception Pages
import ReceptionDashboard from '../pages/staff-reception/ReceptionDashboard';
import ChildRequestList from '../pages/staff-reception/ChildRequestList';
import ChildList from '../pages/staff-reception/ChildList';

// Staff Adoption Pages
import AdoptionDashboard from '../pages/staff-adoption/AdoptionDashboard';
import AdoptionRequestList from '../pages/staff-adoption/AdoptionRequestList';

// Manager Pages
import ManagerDashboard from '../pages/manager/ManagerDashboard';
import PendingProfileList from '../pages/manager/PendingProfileList';
import Statistics from '../pages/manager/Statistics';

import { ROLES } from '../utils/constants';
import NotFound from '../components/common/NotFound';

// Route bảo vệ theo role
function PrivateRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/dang-nhap" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ===== GUEST ROUTES ===== */}
        <Route element={<GuestLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/huong-dan" element={<GuidePage />} />
          <Route path="/dang-nhap" element={<LoginPage />} />
          <Route path="/dang-ky" element={<RegisterPage />} />
        </Route>

        {/* ===== SENDER ROUTES ===== */}
        <Route element={
          <PrivateRoute allowedRoles={[ROLES.SENDER]}>
            <UserLayout />
          </PrivateRoute>
        }>
          <Route path="/gui-tre" element={<SenderDashboard />} />
          <Route path="/gui-tre/tao-yeu-cau" element={<CreateChildRequest />} />
          <Route path="/gui-tre/trang-thai" element={<RequestStatus />} />
        </Route>

        {/* ===== ADOPTER ROUTES ===== */}
        <Route element={
          <PrivateRoute allowedRoles={[ROLES.ADOPTER]}>
            <UserLayout />
          </PrivateRoute>
        }>
          <Route path="/nhan-nuoi" element={<AdopterDashboard />} />
          <Route path="/nhan-nuoi/danh-sach-tre" element={<ChildrenList />} />
          <Route path="/nhan-nuoi/tao-yeu-cau" element={<CreateAdoptionRequest />} />
        </Route>

        {/* ===== STAFF RECEPTION ROUTES ===== */}
        <Route element={
          <PrivateRoute allowedRoles={[ROLES.STAFF_RECEPTION]}>
            <UserLayout />
          </PrivateRoute>
        }>
          <Route path="/can-bo-tiep-nhan" element={<ReceptionDashboard />} />
          <Route path="/can-bo-tiep-nhan/yeu-cau-gui-tre" element={<ChildRequestList />} />
          <Route path="/can-bo-tiep-nhan/danh-sach-tre" element={<ChildList />} />
        </Route>

        {/* ===== STAFF ADOPTION ROUTES ===== */}
        <Route element={
          <PrivateRoute allowedRoles={[ROLES.STAFF_ADOPTION]}>
            <UserLayout />
          </PrivateRoute>
        }>
          <Route path="/can-bo-nhan-nuoi" element={<AdoptionDashboard />} />
          <Route path="/can-bo-nhan-nuoi/yeu-cau" element={<AdoptionRequestList />} />
        </Route>

        {/* ===== MANAGER ROUTES ===== */}
        <Route element={
          <PrivateRoute allowedRoles={[ROLES.MANAGER]}>
            <UserLayout />
          </PrivateRoute>
        }>
          <Route path="/truong-phong" element={<ManagerDashboard />} />
          <Route path="/truong-phong/ho-so-cho-duyet" element={<PendingProfileList />} />
          <Route path="/truong-phong/lichsu-hoso" element={<ProfileHistory />} />
          <Route path="/truong-phong/thong-ke" element={<Statistics />} />
        </Route>

        {/* ===== ADMIN ROUTES ===== */}
        <Route element={
          <PrivateRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminLayout />
          </PrivateRoute>
        }>
          <Route path="/admin/tai-khoan" element={<AccountList />} />
          <Route path="/admin/phan-quyen" element={<RoleManagement />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
