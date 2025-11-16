import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import ChatBot from './ChatBot';

const Layout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo */}
              <Link to="/" className="flex-shrink-0 flex items-center">
                <div className="text-2xl font-bold text-gradient">
                  🌾 AgriSupport
                </div>
              </Link>

              {/* Main Navigation */}
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <Link
                  to="/"
                  className={`nav-link ${isActivePath('/') && !isActivePath('/farmer') && !isActivePath('/admin') ? 'active' : ''}`}
                >
                  Home
                </Link>

                {isAuthenticated && user?.role === 'farmer' && (
                  <>
                    <Link
                      to="/farmer/recommendations"
                      className={`nav-link ${isActivePath('/farmer/recommendations') ? 'active' : ''}`}
                    >
                      Recommendations
                    </Link>
                    <Link
                      to="/farmer/plant-disease"
                      className={`nav-link ${isActivePath('/farmer/plant-disease') ? 'active' : ''}`}
                    >
                      Disease Detection
                    </Link>
                    <Link
                      to="/farmer/marketplace"
                      className={`nav-link ${isActivePath('/farmer/marketplace') ? 'active' : ''}`}
                    >
                      Marketplace
                    </Link>
                    <Link
                      to="/farmer/schemes"
                      className={`nav-link ${isActivePath('/farmer/schemes') ? 'active' : ''}`}
                    >
                      Schemes
                    </Link>
                  </>
                )}

                {isAuthenticated && user?.role === 'admin' && (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className={`nav-link ${isActivePath('/admin/dashboard') ? 'active' : ''}`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/admin/crops"
                      className={`nav-link ${isActivePath('/admin/crops') ? 'active' : ''}`}
                    >
                      Manage Crops
                    </Link>
                    <Link
                      to="/admin/marketplace"
                      className={`nav-link ${isActivePath('/admin/marketplace') ? 'active' : ''}`}
                    >
                      Marketplace
                    </Link>
                  </>
                )}

                <Link
                  to="/schemes"
                  className={`nav-link ${isActivePath('/schemes') ? 'active' : ''}`}
                >
                  Schemes
                </Link>

                <Link
                  to="/about"
                  className={`nav-link ${isActivePath('/about') ? 'active' : ''}`}
                >
                  About
                </Link>

                <Link
                  to="/contact"
                  className={`nav-link ${isActivePath('/contact') ? 'active' : ''}`}
                >
                  Contact
                </Link>
              </div>
            </div>

            {/* User menu */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="hidden sm:block">
                      <div className="text-sm font-medium text-gray-900">
                        {user?.name}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {user?.role}
                      </div>
                    </div>
                    {user?.profileImage ? (
                      <img
                        className="h-8 w-8 rounded-full"
                        src={user.profileImage}
                        alt={user.name}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn-outline text-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn-outline text-sm"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-sm"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                aria-label="Toggle navigation"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="nav-link block"
            >
              Home
            </Link>

            {isAuthenticated && user?.role === 'farmer' && (
              <>
                <Link
                  to="/farmer/recommendations"
                  className="nav-link block"
                >
                  Recommendations
                </Link>
                <Link
                  to="/farmer/plant-disease"
                  className="nav-link block"
                >
                  Disease Detection
                </Link>
                <Link
                  to="/farmer/marketplace"
                  className="nav-link block"
                >
                  Marketplace
                </Link>
                <Link
                  to="/farmer/schemes"
                  className="nav-link block"
                >
                  Schemes
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === 'admin' && (
              <>
                <Link
                  to="/admin/dashboard"
                  className="nav-link block"
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/crops"
                  className="nav-link block"
                >
                  Manage Crops
                </Link>
              </>
            )}

            <Link
              to="/schemes"
              className="nav-link block"
            >
              Schemes
            </Link>

            <Link
              to="/about"
              className="nav-link block"
            >
              About
            </Link>

            <Link
              to="/contact"
              className="nav-link block"
            >
              Contact
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-500 text-sm">
              © 2024 Smart Agriculture Support System. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/about" className="text-gray-500 hover:text-primary-600 text-sm">
                About
              </Link>
              <Link to="/contact" className="text-gray-500 hover:text-primary-600 text-sm">
                Contact
              </Link>
              <Link to="/privacy" className="text-gray-500 hover:text-primary-600 text-sm">
                Privacy
              </Link>
              <Link to="/terms" className="text-gray-500 hover:text-primary-600 text-sm">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ChatBot - Only show for authenticated users */}
      {isAuthenticated && <ChatBot />}
    </div>
  );
};

export default Layout;