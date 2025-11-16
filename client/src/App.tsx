import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Layout components
import Layout from '@/components/Layout';
import AuthLayout from '@/components/AuthLayout';

// Auth pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';

// Farmer pages
import HomePage from '@/pages/farmer/HomePage';
import CropRecommendationPage from '@/pages/farmer/CropRecommendationPage';
import InsightsPage from '@/pages/farmer/InsightsPage';
import PricePredictionPage from '@/pages/farmer/PricePredictionPage';
import PlantDiseasePage from '@/pages/farmer/PlantDiseasePage';
import GovernmentSchemesPage from '@/pages/farmer/GovernmentSchemesPage';
import MarketplacePage from '@/pages/farmer/MarketplacePage';
import SupportPage from '@/pages/farmer/SupportPage';

// Admin pages
import AdminHomePage from '@/pages/admin/AdminHomePage';
import ManageCropsPage from '@/pages/admin/ManageCropsPage';
import ManageUsersPage from '@/pages/admin/ManageUsersPage';
import ManageSchemesPage from '@/pages/admin/ManageSchemesPage';
import ManageMarketplacePage from '@/pages/admin/ManageMarketplacePage';

// Common pages
import NotFoundPage from '@/pages/common/NotFoundPage';
import AboutPage from '@/pages/common/AboutPage';
import ContactPage from '@/pages/common/ContactPage';

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string | string[] }> = ({
  children,
  requiredRole
}) => {
  const { user, isAuthenticated, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!user || !allowedRoles.includes(user.role)) {
      return <Navigate to="/farmer/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

// Public route wrapper (redirect to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/farmer/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="schemes" element={<GovernmentSchemesPage />} />
        </Route>

        {/* Auth routes */}
        <Route path="/login" element={
          <PublicRoute>
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <AuthLayout>
              <RegisterPage />
            </AuthLayout>
          </PublicRoute>
        } />
        <Route path="/forgot-password" element={
          <PublicRoute>
            <AuthLayout>
              <ForgotPasswordPage />
            </AuthLayout>
          </PublicRoute>
        } />

        {/* Farmer routes */}
        <Route path="/farmer" element={
          <ProtectedRoute requiredRole="farmer">
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<HomePage />} />
          <Route path="recommendations" element={<CropRecommendationPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="price-prediction" element={<PricePredictionPage />} />
          <Route path="plant-disease" element={<PlantDiseasePage />} />
          <Route path="schemes" element={<GovernmentSchemesPage />} />
          <Route path="marketplace" element={<MarketplacePage />} />
          <Route path="support" element={<SupportPage />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminHomePage />} />
          <Route path="crops" element={<ManageCropsPage />} />
          <Route path="users" element={<ManageUsersPage />} />
          <Route path="schemes" element={<ManageSchemesPage />} />
          <Route path="marketplace" element={<ManageMarketplacePage />} />
        </Route>

        {/* 404 route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;