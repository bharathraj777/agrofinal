import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/authStore';
import { Eye, EyeOff, Mail, Lock, User, Smartphone, LogIn, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface SocialLoginButton {
  name: string;
  icon: React.ReactNode;
  color: string;
  provider: string;
  href: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState<'password' | 'otp'>('password');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [activeTab, setActiveTab] = useState(0);

  const socialButtons: SocialLoginButton[] = [
    {
      name: 'Google',
      icon: 'G',
      color: 'bg-red-600 hover:bg-red-700',
      provider: 'Google',
      href: '#'
    },
    {
      name: 'Facebook',
      icon: 'F',
      color: 'bg-blue-600 hover:bg-blue-700',
      provider: 'Facebook',
      href: '#'
    },
    {
      name: 'Microsoft',
      icon: 'M',
      color: 'bg-indigo-600 hover:bg-indigo-700',
      provider: 'Microsoft',
      href: '#'
    },
    {
      name: 'Apple',
      icon: 'A',
      color: 'bg-gray-800 hover:bg-gray-900',
      provider: 'Apple',
      href: '#'
    }
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<FormData>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && !loading) {
      const userRole = useAuthStore.getState().user?.role;
      navigate(userRole === 'admin' ? '/admin/dashboard' : '/farmer/dashboard');
    }
  }, [isAuthenticated, loading, location]);

  const handleGoogleLogin = async () => {
    try {
      // Simulate Google OAuth
      toast.success('Google login coming soon!');
    } catch (error) {
      toast.error('Google login failed');
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const getBackgroundImage = () => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 8) return 'https://images.unsplash.com/photo-15975244677-036f362a4595640d20bf6257f817';
    if (hours >= 8 && hours < 16) return 'https://images.unsplash.com/photo-1506758569f47332e2f918';
    if (hours >= 16 && hours < 19) return 'https://images.unsplash.com/photo-147912676816672ac7964f';
    if (hours >= 19 || hours < 5) return 'https://images.unsplash.com/photo-1506758569f47332e2f918';
    return 'https://images.unsplash.com/photo-1449289550483031266658';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Background Image */}
      <div
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: `url(${getBackgroundImage()})`,
          filter: 'blur(8px)'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden sm:max-w-lg lg:max-w-4xl">
          <div className="bg-white p-8 sm:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center items-center space-x-2">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white shadow-lg mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">🌾 AgriSupport</h1>
                  <div className="text-sm text-gray-600">Smart Agriculture</div>
                </div>
              </div>

              {/* User Profile Preview */}
              <div className="hidden sm:flex justify-center">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                  {location.pathname.includes('admin') ? (
                    <Shield className="w-6 h-6 text-white" />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center text-center">
              <h2 className="text-xl font-bold text-gray-900">
                {location.pathname.includes('admin') ? 'Welcome back,' : 'Welcome back to'}
                {' '}
                <span className="text-emerald-600">AgriSupport</span>
              </h2>
              <p className="text-gray-600">
                {location.pathname.includes('admin')
                  ? 'Ready to manage your agricultural platform.'
                  : 'Ready to manage your farm.'}
              </p>
            </div>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-xl shadow-xl p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
                Sign in to your account
              </h2>
              <p className="text-gray-600">
                Access your dashboard to manage crops, view analytics, and connect with buyers
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center mb-6">
              <div className="bg-gray-100 rounded-lg p-1 inline-flex">
                <button
                  onClick={() => setActiveTab(0)}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors duration-200 ${
                    activeTab === 0 ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  <span className="ml-2">Login</span>
                </button>
                <button
                  onClick={() => setActiveTab(1)}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors duration-200 ${
                    activeTab === 1 ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  <span className="ml-2">OTP Login</span>
                </button>
              </div>

              {/* Social Login Buttons */}
              {activeTab === 0 && (
                <div className="mt-6">
                  <p className="text-center text-gray-500 text-sm mb-4">Or continue with:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {socialButtons.map((social) => (
                      <button
                        key={social.name}
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center px-4 py-3 rounded-lg text-white font-medium transition-colors duration-200 hover:shadow-lg bg-white hover:scale-105"
                        style={{ backgroundColor: social.color }}
                      >
                        <social.icon className="w-5 h-5" />
                        <span className="ml-2">{social.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 1 && (
                <div className="mt-6">
                  <p className="text-center text-gray-500 text-sm mb-4">Enter your OTP code:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 1, 2, 3].map((index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength={1}
                        value={otp[index]}
                        onChange={(e) => {
                          const newOtp = [...otp];
                          newOtp[index] = e.target.value;
                          setOtp(newOtp);
                        }}
                        className="w-full text-center text-2xl font-bold py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="0"
                        autoFocus
                      />
                    ))}
                  </div>
                  <button
                    disabled={otp.join('').length < 4}
                    onClick={() => {
                      // Handle OTP submission
                    }}
                    className="w-full mt-4 bg-emerald-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Verify OTP
                  </button>
                </div>
              )}
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {activeTab === 0 && (
                <>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-5 text-gray-400" />
                      <input
                        {...register('email', {
                          className: `w-full pl-10 pr-10 py-3 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                            errors.email ? 'border-red-500' : ''
                          } text-sm placeholder-gray-400 placeholder:text-gray-500 ${errors.email ? 'text-red-500' : ''} ${
                            errors.email ? 'focus:ring-2 focus:ring-red-500' : 'focus:ring-2 focus:ring-emerald-500'
                          }`}
                        placeholder="Enter your email"
                        autoComplete="email"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 text-gray-400" />
                      <input
                        {...register('password', {
                          className: `w-full pl-10 pr-10 py-3 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                            errors.password ? 'border-red-500' : ''
                          } ${showPassword ? 'text-gray-900' : 'text-gray-400 placeholder-gray-400 placeholder:text-gray-400 ${errors.password ? 'text-red-500' : ''} ${
                            errors.password ? 'focus:ring-2 focus:ring-red-500' : 'focus:ring-2 focus:ring-emerald-500'
                          }`}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                      />
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('rememberMe')}
                        className="h-4 w-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Remember me</span>
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    </div>
                      <span className="ml-2 text-sm text-gray-700">Secure Connection</span>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-emerald-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <span className="loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                          </span>
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4 mr-2" />
                          <span className="ml-2">Sign In</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
              )}

              {activeTab === 1 && (
                <>
                  <div className="space-y-4">
                    <p className="text-center text-gray-500 text-sm mb-4">
                      Enter the 4-digit OTP sent to your registered mobile number
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-center text-sm text-gray-600 mb-4">
                      {otp.join('')}
                    </p>
                  </div>
                </>
              )}
            </form>

            {/* Demo Access */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-blue-600 mb-2" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">Quick Demo Access</h3>
                  <p className="text-sm text-blue-700">
                    Experience our platform without registration
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={() => {
                    login('demo-admin@example.com', 'AdminPass123!');
                  }}
                  className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700"
                >
                  Admin Dashboard
                </button>
                <button
                  onClick={() => {
                    login('demo-farmer@example.com', 'FarmerPass123!');
                  }}
                  className="w-full bg-green-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-green-700"
                >
                  Farmer Dashboard
                </button>
              </div>

              <div className="mt-3 text-center">
                <p className="text-xs text-blue-600">
                  Use these credentials to explore the full platform
                </p>
              </div>
            </div>
          </div>

          {/* Redirect Links */}
          <div className="flex justify-center space-x-4 text-center">
            <div className="mt-8">
              <p className="text-sm text-gray-500">
                Don't have an account?
              </p>
              <div className="flex space-x-4">
                <Link
                  to="/register"
                  className="text-emerald-600 hover:text-emerald-700 font-medium underline"
                >
                  Sign up
                </Link>
                <Link
                  to="/about"
                  className="text-emerald-600 hover:text-emerald-700 font-medium underline ml-4"
                >
                  About AgriSupport
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;