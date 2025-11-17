import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import ChatBot from './ChatBot';
import {
  Menu,
  X,
  Home,
  TrendingUp,
  Package,
  MessageSquare,
  Users,
  Settings,
  Leaf,
  ChevronDown,
  LogOut,
  User,
  MenuIcon,
  Activity,
  BarChart3,
  Shield,
  Smartphone,
  Mail,
  Phone,
  MapPin,
  Clock,
  Zap,
  Globe,
  HelpCircle
} from 'lucide-react';

const Layout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserMenuOpen) {
        const userMenuButton = document.getElementById('user-menu-button');
        const userMenu = document.getElementById('user-menu');

        if (userMenuButton && userMenu &&
            !userMenuButton.contains(event.target as Node) &&
            !userMenu.contains(event.target as Node)) {
          setIsUserMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const navItems = [
    {
      icon: Home,
      label: 'Dashboard',
      path: '/',
      roles: ['farmer', 'admin'],
      color: 'text-blue-600',
      description: 'Overview and analytics'
    },
    {
      icon: TrendingUp,
      label: 'Recommendations',
      path: '/farmer/recommendations',
      roles: ['farmer'],
      color: 'text-green-600',
      description: 'AI-powered crop suggestions'
    },
    {
      icon: Shield,
      label: 'Disease Detection',
      path: '/farmer/plant-disease',
      roles: ['farmer'],
      color: 'text-red-600',
      description: 'Plant health analysis'
    },
    {
      icon: Package,
      label: 'Marketplace',
      path: '/farmer/marketplace',
      roles: ['farmer'],
      color: 'text-purple-600',
      description: 'Buy and sell crops'
    },
    {
      icon: MessageSquare,
      label: 'Schemes',
      path: '/farmer/schemes',
      roles: ['farmer'],
      color: 'text-orange-600',
      description: 'Government schemes and subsidies'
    },
    {
      icon: BarChart3,
      label: 'Price Prediction',
      path: '/farmer/price-prediction',
      roles: ['farmer'],
      color: 'text-indigo-600',
      description: 'Market price forecasting'
    }
  ];

  const adminNavItems = [
    {
      icon: Home,
      label: 'Dashboard',
      path: '/admin/dashboard',
      roles: ['admin'],
      color: 'text-indigo-600',
      description: 'Admin overview'
    },
    {
      icon: Users,
      label: 'Manage Users',
      path: '/admin/users',
      roles: ['admin'],
      color: 'text-blue-600',
      description: 'User management'
    },
    {
      icon: Package,
      label: 'Manage Crops',
      path: '/admin/crops',
      roles: ['admin'],
      color: 'text-green-600',
      description: 'Crop database'
    },
    {
      icon: MessageSquare,
      label: 'Manage Schemes',
      path: '/admin/schemes',
      roles: ['admin'],
      color: 'text-orange-600',
      description: 'Scheme administration'
    },
    {
      icon: Package,
      label: 'Manage Marketplace',
      path: '/admin/marketplace',
      roles: ['admin'],
      color: 'text-purple-600',
      description: 'Marketplace management'
    }
  ];

  const publicNavItems = [
    {
      icon: MessageSquare,
      label: 'Schemes',
      path: '/schemes',
      roles: [],
      color: 'text-orange-600',
      description: 'Public schemes access'
    },
    {
      icon: MenuIcon,
      label: 'About',
      path: '/about',
      roles: [],
      color: 'text-gray-600',
      description: 'Learn more about us'
    },
    {
      icon: Mail,
      label: 'Contact',
      path: '/contact',
      roles: [],
      color: 'text-gray-600',
      description: 'Get in touch'
    }
  ];

  const getNavItems = () => {
    if (isAuthenticated && user?.role === 'admin') return adminNavItems;
    if (isAuthenticated && user?.role === 'farmer') return navItems;
    return publicNavItems;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <Link
              to="/"
              className="flex items-center space-x-3 group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
                <span className="text-2xl font-bold text-white">🌾</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  AgriSupport
                </span>
                <div className="text-sm text-gray-500 font-medium">Smart Agriculture</div>
              </div>
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search crops, schemes, markets..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="submit"
                      className="p-1 text-emerald-600 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <Zap className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {getNavItems().map((item) => (
                item.roles.length === 0 || item.roles.includes(user?.role || '') ? (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative group flex flex-col items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActivePath(item.path)
                        ? 'bg-' + item.color.split('-')[1] + '-100 text-' + item.color
                        : 'text-gray-700 hover:bg-gray-100 hover:text-' + item.color
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActivePath(item.path) ? 'text-' + item.color : 'text-gray-500'}`} />
                    <span className="ml-2">{item.label}</span>
                    {isActivePath(item.path) && (
                      <div className="absolute -bottom-px left-1/2 right-1/2 w-full h-0.5 bg-gradient-to-r from-transparent via-' + item.color + ' to-transparent transform scale-x-100 group-hover:scale-x-110"></div>
                    )}
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="font-medium">{item.description}</div>
                    </div>
                  </Link>
                ) : null
              ))}
            </div>

            {/* User Account Section */}
            {isAuthenticated && (
              <div className="hidden lg:flex items-center space-x-4 ml-6 pl-6 border-l border-gray-300">
                <div className="relative">
                  <button
                    id="user-menu-button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                      {user?.profileImage ? (
                        <img
                          className="w-full h-full rounded-full object-cover border-2 border-white"
                          src={user.profileImage}
                          alt={user.name}
                        />
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                      <div className="flex items-center space-x-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {user?.role}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </div>
                    </div>
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div
                      id="user-menu"
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-1 z-50"
                    >
                      <Link
                        to="/farmer/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <Activity className="w-4 h-4 mr-3 text-gray-500" />
                        <div className="flex flex-col">
                          <span className="font-medium">My Dashboard</span>
                          <span className="text-xs text-gray-500">View overview and analytics</span>
                        </div>
                      </Link>
                      <Link
                        to="/farmer/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <Settings className="w-4 h-4 mr-3 text-gray-500" />
                        <div className="flex flex-col">
                          <span className="font-medium">Edit Profile</span>
                          <span className="text-xs text-gray-500">Update your information</span>
                        </div>
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          <div className="flex flex-col">
                            <span className="font-medium">Logout</span>
                            <span className="text-xs text-gray-500">Sign out of your account</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            )}

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></div>
                <Globe className="w-5 h-5 text-gray-500" />
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50">
                  <h3 className="font-semibold text-gray-900 mb-3">Notifications</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900">New message from support</p>
                          <p className="text-xs text-gray-500">Check your chatbot conversation</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-1"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-900">Crop recommendation ready</p>
                          <p className="text-xs text-gray-500">View your personalized suggestions</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-1"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-orange-900">Marketplace listing expiring</p>
                          <p className="text-xs text-gray-500">2 listings expiring tomorrow</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-500" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-500" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">🌾</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">AgriSupport</h3>
                  <p className="text-sm text-gray-500">Smart Agriculture</p>
                </div>
              </div>
            </div>

            <div className="p-4">
              {getNavItems().map((item) => (
                item.roles.length === 0 || item.roles.includes(user?.role || '') ? (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                      isActivePath(item.path)
                        ? 'bg-' + item.color.split('-')[1] + '-100 text-' + item.color
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActivePath(item.path) ? 'text-' + item.color : 'text-gray-500'}`} />
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </Link>
                ) : null
              ))}
            </div>

            {/* Mobile User Section */}
            {isAuthenticated && (
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    {user?.profileImage ? (
                      <img
                        className="w-full h-full rounded-full object-cover border-2 border-white"
                        src={user.profileImage}
                        alt={user.name}
                      />
                    ) : (
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{user?.name}</div>
                    <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      {user?.role}
                    </div>
                  </div>
                </div>
                <Link
                  to="/farmer/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 w-full"
                >
                  <Activity className="w-5 h-5" />
                  <span className="font-medium">My Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 w-full mt-3"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">🌾</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">AgriSupport</h3>
                  <p className="text-sm text-gray-300">Smart Agriculture Solutions</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Empowering Indian farmers with AI-powered tools for better yields, sustainable practices, and market connections.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="/about"
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>About</span>
                </a>
                <a
                  href="/contact"
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
                >
                  <Mail className="w-4 h-4" />
                  <span>Contact</span>
                </a>
                <a
                  href="/schemes"
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
                >
                  <Globe className="w-4 h-4" />
                  <span>Schemes</span>
                </a>
                <a
                  href="/marketplace"
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
                >
                  <Package className="w-4 h-4" />
                  <span>Marketplace</span>
                </a>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold text-white mb-4">Our Services</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <span className="font-medium text-white">Crop Recommendations</span>
                    <p className="text-xs text-gray-400">AI-powered suggestions</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <span className="font-medium text-white">Disease Detection</span>
                    <p className="text-xs text-gray-400">Plant health analysis</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <span className="font-medium text-white">Marketplace</span>
                    <p className="text-xs text-gray-400">Trade crops easily</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="col-span-1 md:col-span-2">
              <h4 className="font-semibold text-white mb-4">Connect With Us</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-white">24/7 Support</div>
                    <div className="text-xs text-gray-400">Mon-Fri, 9AM-6PM</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-white">support@agrisupport.in</div>
                    <div className="text-xs text-gray-400">Quick response guaranteed</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-white">Pune, India</div>
                    <div className="text-xs text-gray-400">Visit our office</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div className="col-span-1 md:col-span-1">
              <h4 className="font-semibold text-white mb-4">Stay Updated</h4>
              <p className="text-gray-400 text-sm mb-4">
                Get the latest farming tips, market trends, and feature updates delivered to your inbox.
              </p>
              <form className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium transition-colors duration-200"
                >
                  Subscribe
                </button>
              </form>
            </div>

            {/* Social Links */}
            <div className="col-span-1 md:col-span-1">
              <h4 className="font-semibold text-white mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors duration-200"
                >
                  <Globe className="w-5 h-5 text-gray-300" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors duration-200"
                >
                  <MessageSquare className="w-5 h-5 text-gray-300" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-sm">
                © 2024 AgriSupport. All rights reserved.
              </div>
              <div className="flex space-x-6 text-sm">
                <a href="/privacy" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Privacy Policy
                </a>
                <span className="text-gray-500">•</span>
                <a href="/terms" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* ChatBot - Show for authenticated users */}
      {isAuthenticated && <ChatBot />}
    </div>
  );
};

export default Layout;