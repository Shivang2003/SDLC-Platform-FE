
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../features/auth/pages/LoginPage";
import SignupPage from "../features/auth/pages/SignupPage";
import { useAuthStore } from "../stores/authStore";

function OrganizationsPlaceholder() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
      <h1 className="text-2xl font-bold text-gray-900">
        Authentication successful
      </h1>
      <p className="text-gray-600">
        Your organizations page will be built next.
      </p>
      <button
        onClick={logout}
        className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-700"
      >
        Sign out
      </button>
    </main>
  );
}

function RootRedirect() {
  const token = useAuthStore((state) => state.token);
  return <Navigate to={token ? "/organizations" : "/login"} replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<SignupPage />} />
        <Route
          path="/organizations"
          element={<OrganizationsPlaceholder />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
