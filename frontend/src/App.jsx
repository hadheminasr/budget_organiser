import { Navigate, Route, Routes } from "react-router-dom";
import FloatingShape from "./components/FloatingShape";

import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

import Messagerie from "./pages/Admin/Messagerie";
import LoadingSpinner from "./components/LoadingSpinner";
import VueGlobal from "./pages/Admin/VueGlobal/VueGlobale";
import ActiviteComportement from "./pages/Admin/ActiviteComportement/ActiviteComportement";
import FinancierCategorie from "./pages/Admin/FinancierCategorie/FinancierCategorie";
import UserDash from "./pages/User/UserDash";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";

// ✅ SAME AS YOUR RoleHome BUT USING CONTEXT
const RoleHome = () => {
  const { user } = useAuth();
  if (user?.role === "admin") return <Navigate to="/admin" replace />;
  return <Navigate to="/user" replace />;
};

// ✅ SAME AS YOUR ProtectedRoute BUT USING CONTEXT
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.isVerified) return <Navigate to="/verify-email" replace />;

  return children;
};

// ✅ SAME AS YOUR AdminRoute BUT USING CONTEXT
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;

  return children;
};

// ✅ SAME AS YOUR RedirectAuthenticatedUser BUT USING CONTEXT
const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user?.isVerified) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { isCheckingAuth } = useAuth();

  // ✅ IMPORTANT:
  // In context version, checkAuth() runs inside AuthProvider useEffect already.
  // So App.jsx doesn't need useEffect(checkAuth) anymore.
  // (If you want it here, you can— but you must avoid double calls.)

  if (isCheckingAuth) return <LoadingSpinner />;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50
      flex items-center justify-center relative overflow-hidden"
    >
      <FloatingShape color="bg-rose-200/45" size="w-72 h-72" top="8%" left="10%" delay={0} />
      <FloatingShape color="bg-pink-200/35" size="w-96 h-96" top="35%" left="60%" delay={0.6} />
      <FloatingShape color="bg-amber-200/35" size="w-80 h-80" top="65%" left="18%" delay={1.1} />

      <Routes>
        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <VueGlobal />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/messagerie"
          element={
            <AdminRoute>
              <Messagerie />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/vue-global"
          element={
            <AdminRoute>
              <VueGlobal />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/activite"
          element={
            <AdminRoute>
              <ActiviteComportement />
            </AdminRoute>
          }
        />

        {/* HOME */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RoleHome />
            </ProtectedRoute>
          }
        />

        {/* PUBLIC */}
        <Route
          path="/signup"
          element={
            <RedirectAuthenticatedUser>
              <SignUpPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/login"
          element={
            <RedirectAuthenticatedUser>
              <LoginPage />
            </RedirectAuthenticatedUser>
          }
        />

        <Route path="/verify-email" element={<EmailVerificationPage />} />

        <Route
          path="/forgot-password"
          element={
            <RedirectAuthenticatedUser>
              <ForgotPasswordPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <RedirectAuthenticatedUser>
              <ResetPasswordPage />
            </RedirectAuthenticatedUser>
          }
        />
		<Route
		path="/user"
		element={
			<ProtectedRoute>
			<UserDash />
			</ProtectedRoute>
		}
		/>


        {/* catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster />
    </div>
  );
}

export default App;
