import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/constants';
import { useLocation } from 'react-router-dom';
import { isAdopterProfileComplete, isSenderProfileComplete } from '../utils/profileComplete';
// Layouts
import GuestLayout from '../components/layout/GuestLayout';
import AdminLayout from '../components/layout/AdminLayout';
import NotFound from '../components/common/NotFound';

// ─── Guest ────────────────────────────────────────────
import HomePage from '../pages/guest/HomePage';
import GuidePage from '../pages/guest/GuidePage';
import LoginPage from '../pages/guest/LoginPage';
import RegisterPage from '../pages/guest/RegisterPage';

// ─── Sender ───────────────────────────────────────────
import CreateChildRequest from '../pages/sender/CreateChildRequest';
import UpdateChildRequest from '../pages/sender/UpdateChildRequest';
import RequestStatus from '../pages/sender/RequestStatus';
import SentChildInfo from '../pages/sender/SentChildInfo';
import SenderProfile from '../pages/sender/SenderProfile';

// ─── Adopter ──────────────────────────────────────────
import CreateAdoptionRequest from '../pages/adopter/CreateAdoptionRequest';
import UpdateAdoptionRequest from '../pages/adopter/UpdateAdoptionRequest';
import AdoptionStatus from '../pages/adopter/AdoptionStatus';
import AdopterProfile from '../pages/adopter/AdopterProfile';

// ─── Staff Reception ──────────────────────────────────
import ReceptionDashboard from '../pages/staff-reception/ReceptionDashboard';
import ChildRequestList from '../pages/staff-reception/ChildRequestList';
import ChildRequestDetail from '../pages/staff-reception/ChildRequestDetail';
import ReceptionProfileList from '../pages/staff-reception/ReceptionProfileList';
import ReceptionProfileDetail from '../pages/staff-reception/ReceptionProfileDetail';
import CreateReceptionProfile from '../pages/staff-reception/CreateReceptionProfile';
import ChildList from '../pages/staff-reception/ChildList';
import ChildForm from '../pages/staff-reception/ChildForm';
import ChildHealthList from '../pages/staff-reception/ChildHealthList';
import ChildHealthForm from '../pages/staff-reception/ChildHealthForm';
// ─── Staff Adoption ───────────────────────────────────
import AdoptionDashboard from '../pages/staff-adoption/AdoptionDashboard';
import AdoptionRequestList from '../pages/staff-adoption/AdoptionRequestList';
import AdoptionRequestDetail from '../pages/staff-adoption/AdoptionRequestDetail';
import CreateAdoptionProfile from '../pages/staff-adoption/CreateAdoptionProfile';
import AdoptionProfileList from '../pages/staff-adoption/AdoptionProfileList';
import AdoptionProfileDetail from '../pages/staff-adoption/AdoptionProfileDetail';
// ─── Manager ──────────────────────────────────────────
import ManagerDashboard from '../pages/manager/ManagerDashboard';
import PendingProfileList from '../pages/manager/PendingProfileList';
import ProfileApproval from '../pages/manager/ProfileApproval';
import ProfileHistory from '../pages/manager/ProfileHistory';
import Statistics from '../pages/manager/Statistics';

// ─── Admin ────────────────────────────────────────────
import DashboardAdmin from '../pages/admin/DashboardAdmin';
import AccountList from '../pages/admin/AccountList';
import AccountForm from '../pages/admin/AccountForm';
import RoleManagement from '../pages/admin/RoleManagement';

// ─── Route guard ──────────────────────────────────────
function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/dang-nhap" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/dang-nhap" replace />;
  return children;
}
function RequireCompletedAdopterProfile({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/dang-nhap" replace />;
  }

  if (!isAdopterProfileComplete(user)) {
    return (
      <Navigate
        to="/nhan-nuoi/ho-so?required=1"
        replace
        state={{
          message:
            'Bạn cần hoàn thiện thông tin cá nhân trước khi sử dụng chức năng nhận nuôi.',
        }}
      />
    );
  }

  return children;
}
function RequireCompletedSenderProfile({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/dang-nhap" replace />;
  }

  if (!isSenderProfileComplete(user)) {
    return (
      <Navigate
        to="/gui-tre/ho-so?required=1"
        replace
        state={{
          from: location.pathname,
          message:
            'Bạn cần hoàn thiện thông tin cá nhân trước khi tạo yêu cầu gửi trẻ, theo dõi trạng thái hoặc xem thông tin trẻ đã gửi.',
        }}
      />
    );
  }

  return children;
}
function Guard({ roles, layout: Layout }) {
  return (
    <ProtectedRoute allowedRoles={roles}>
      <Layout />
    </ProtectedRoute>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ─────────────────────────────────── */}
        <Route element={<GuestLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/huong-dan" element={<GuidePage />} />
          <Route path="/dang-nhap" element={<LoginPage />} />
          <Route path="/dang-ky" element={<RegisterPage />} />
        </Route>
        {/* ── Sender /gui-tre/* ───────────────────────── */}
        <Route element={<Guard roles={[ROLES.SENDER]} layout={GuestLayout} />}>
          <Route path="/gui-tre/tao-yeu-cau" element={<RequireCompletedSenderProfile><CreateChildRequest /></RequireCompletedSenderProfile>} />
          <Route path="/gui-tre/thong-tin-tre" element={<RequireCompletedSenderProfile><SentChildInfo /></RequireCompletedSenderProfile>} />
          <Route path="/gui-tre/trang-thai" element={<RequireCompletedSenderProfile><RequestStatus /></RequireCompletedSenderProfile>} />
          <Route path="/gui-tre/cap-nhat/:id" element={<RequireCompletedSenderProfile><UpdateChildRequest /></RequireCompletedSenderProfile>} />
          <Route path="/gui-tre/ho-so" element={<SenderProfile />} />
        </Route>

        {/* ── Adopter /nhan-nuoi/* ────────────────────── */}
        <Route element={<Guard roles={[ROLES.ADOPTER]} layout={GuestLayout} />}>
          <Route path="/nhan-nuoi/tao-don" element={
            <RequireCompletedAdopterProfile><CreateAdoptionRequest /></RequireCompletedAdopterProfile>
          } />
          <Route path="/nhan-nuoi/cap-nhat/:id" element={<UpdateAdoptionRequest />} />
          <Route path="/nhan-nuoi/trang-thai" element={
            <RequireCompletedAdopterProfile><AdoptionStatus /></RequireCompletedAdopterProfile>
          } />
          <Route path="/nhan-nuoi/ho-so" element={<AdopterProfile />} />
        </Route>
        {/* ── Staff Reception /can-bo-tiep-nhan/* ─────── */}
        <Route element={<Guard roles={[ROLES.STAFF_RECEPTION]} layout={AdminLayout} />}>
          <Route path="/can-bo-tiep-nhan" element={<Navigate to="/can-bo-tiep-nhan/dashboard" replace />} />
          <Route path="/can-bo-tiep-nhan/dashboard" element={<ReceptionDashboard />} />

          <Route path="/can-bo-tiep-nhan/yeu-cau" element={<ChildRequestList />} />
          <Route path="/can-bo-tiep-nhan/yeu-cau/:id" element={<ChildRequestDetail />} />

          <Route path="/can-bo-tiep-nhan/ho-so-tiep-nhan" element={<ReceptionProfileList />} />
          <Route path="/can-bo-tiep-nhan/ho-so-tiep-nhan/:id" element={<ReceptionProfileDetail />} />
          <Route path="/can-bo-tiep-nhan/tao-ho-so/:requestId" element={<CreateReceptionProfile />} />

          <Route path="/can-bo-tiep-nhan/tre" element={<ChildList />} />
          <Route path="/can-bo-tiep-nhan/tre/:id" element={<ChildForm />} />
          {/* Sức khỏe trẻ */}
          <Route path="/can-bo-tiep-nhan/suc-khoe" element={<ChildHealthList />} />
          <Route path="/can-bo-tiep-nhan/suc-khoe/tre/:childId" element={<ChildHealthForm />} />
          <Route path="/can-bo-tiep-nhan/suc-khoe/tre/:childId/tao" element={<ChildHealthForm />} />
        </Route>
        {/* ── Staff Adoption /can-bo-nhan-nuoi/* ─────── */}
        <Route element={<Guard roles={[ROLES.STAFF_ADOPTION]} layout={AdminLayout} />}>
          <Route path="/can-bo-nhan-nuoi" element={<Navigate to="/can-bo-nhan-nuoi/dashboard" replace />} />
          <Route path="/can-bo-nhan-nuoi/dashboard" element={<AdoptionDashboard />} />
          <Route path="/can-bo-nhan-nuoi/danh-sach" element={<AdoptionRequestList />} />
          <Route path="/can-bo-nhan-nuoi/chi-tiet/:id" element={<AdoptionRequestDetail />} />
          <Route path="/can-bo-nhan-nuoi/tao-ho-so/:requestId" element={<CreateAdoptionProfile />} />
          <Route path="/can-bo-nhan-nuoi/ho-so" element={<AdoptionProfileList />} />
          <Route path="/can-bo-nhan-nuoi/ho-so/:profileId" element={<AdoptionProfileDetail />} />
        </Route>

        {/* ── Manager /truong-phong/* ─────────────────── */}
        <Route element={<Guard roles={[ROLES.MANAGER]} layout={AdminLayout} />}>
          <Route path="/truong-phong/dashboard" element={<ManagerDashboard />} />
          <Route path="/truong-phong/cho-duyet" element={<PendingProfileList />} />
          <Route path="/truong-phong/lichsu-hoso" element={<ProfileHistory />} />
          <Route path="/truong-phong/duyet/:type/:id" element={<ProfileApproval />} />
          <Route path="/truong-phong/thong-ke" element={<Statistics />} />
        </Route>

        {/* ── Admin /admin/* ──────────────────────────── */}
        <Route element={<Guard roles={[ROLES.ADMIN]} layout={AdminLayout} />}>
          <Route path="/admin/dashboard" element={<DashboardAdmin />} />
          <Route path="/admin/accounts" element={<AccountList />} />
          <Route path="/admin/accounts/new" element={<AccountForm />} />
          <Route path="/admin/accounts/:id/edit" element={<AccountForm />} />
          <Route path="/admin/roles" element={<RoleManagement />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
