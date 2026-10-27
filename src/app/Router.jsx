
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import ProjectsPage from "../pages/ProjectsPage";
import ProjectFeaturesPage from "../pages/ProjectFeaturesPage";
import MainLayout from "../layouts/MainLayout";
import ProjectsEmptyState from "../components/projects/ProjectsEmptyState";

function RootRedirect() {
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );
  const isCheckingAuth = useAuthStore(
    (state) => state.isCheckingAuth
  );

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <Navigate
      to={isAuthenticated ? "/projects" : "/login"}
      replace
    />
  );
}

function ProtectedRoute() {
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );
  const isCheckingAuth = useAuthStore(
    (state) => state.isCheckingAuth
  );

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return isAuthenticated ? (
    <MainLayout />
  ) : (
    <Navigate to="/login" replace />
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<SignupPage />} />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/projects"
            element={
              <ProjectsEmptyState
                title="Select an organization"
                description="Choose an organization from the sidebar to view its projects."
              />
            }
          />
          <Route
            path="/projects/:projectId"
            element={<ProjectFeaturesPage />}
          />
          <Route
            path="/organizations/:organizationId/projects"
            element={<ProjectsPage />}
          />
          <Route
            path="/organizations/:organizationId/projects/:projectId"
            element={<ProjectFeaturesPage />}
          />
          <Route
            path="/organizations/:organizationId/projects/:projectId/features/:featureId"
            element={<ProjectFeaturesPage />}
          />
          <Route
            path="/projects/:projectId/features/:featureId"
            element={<ProjectFeaturesPage />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
