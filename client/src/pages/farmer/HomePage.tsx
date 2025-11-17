import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  Home,
  TrendingUp,
  Droplets,
  Sun,
  Wind,
  Thermometer,
  Sprout,
  Microscope,
  ShoppingCart,
  Building,
  BarChart3,
  Activity,
  Bell,
  Search,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Zap,
  Target,
  Users,
  Star,
  Award,
  Cloud,
  Eye
} from 'lucide-react';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ElementType;
  link: string;
  color: string;
  trend?: { value: number; isPositive: boolean };
  badge?: string;
}

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: React.ElementType;
}

interface RecentActivity {
  id: string;
  type: 'recommendation' | 'disease_check' | 'listing' | 'scheme';
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

const HomePage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(3);
  const [isLoading, setIsLoading] = useState(true);

  // Simulated data - in real app, these would come from API
  const [stats, setStats] = useState({
    recommendations: 12,
    diseaseChecks: 8,
    listings: 3,
    schemesApplied: 5,
    totalRevenue: 45670,
    monthlyGrowth: 12.5
  });

  const quickActions: QuickAction[] = [
    {
      title: 'Crop Recommendations',
      description: 'Get AI-powered crop suggestions based on your soil and climate',
      icon: Sprout,
      link: '/farmer/recommendations',
      color: 'emerald',
      trend: { value: 8, isPositive: true },
      badge: 'New'
    },
    {
      title: 'Plant Disease Detection',
      description: 'Identify diseases using AI-powered image analysis',
      icon: Microscope,
      link: '/farmer/plant-disease',
      color: 'blue',
      trend: { value: 15, isPositive: true }
    },
    {
      title: 'Marketplace',
      description: 'Buy and sell agricultural products directly',
      icon: ShoppingCart,
      link: '/farmer/marketplace',
      color: 'amber',
      trend: { value: 5, isPositive: false }
    },
    {
      title: 'Government Schemes',
      description: 'Discover and apply for agricultural schemes',
      icon: Building,
      link: '/farmer/schemes',
      color: 'purple',
      trend: { value: 20, isPositive: true }
    },
    {
      title: 'Price Predictions',
      description: 'Get insights into future crop prices and trends',
      icon: BarChart3,
      link: '/farmer/price-prediction',
      color: 'red',
      trend: { value: 10, isPositive: true }
    },
    {
      title: 'Farm Analytics',
      description: 'View detailed analytics of your farming activities',
      icon: Activity,
      link: '/farmer/insights',
      color: 'indigo',
      trend: { value: 18, isPositive: true }
    }
  ];

  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'recommendation',
      title: 'Wheat Crop Recommendation',
      description: 'AI suggested wheat cultivation for current season',
      timestamp: '2 hours ago',
      status: 'completed'
    },
    {
      id: '2',
      type: 'disease_check',
      title: 'Tomato Leaf Analysis',
      description: 'Early blight detected in tomato plants',
      timestamp: '5 hours ago',
      status: 'completed'
    },
    {
      id: '3',
      type: 'listing',
      title: 'Rice Marketplace Listing',
      description: 'Premium basmati rice listed for ₹3200/quintal',
      timestamp: '1 day ago',
      status: 'pending'
    },
    {
      id: '4',
      type: 'scheme',
      title: 'PM-Kisan Scheme',
      description: 'Application submitted for income support',
      timestamp: '2 days ago',
      status: 'pending'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: { bg: string; text: string; icon: string; border: string; from: string; to: string } } = {
      emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-600', border: 'border-emerald-200', from: 'from-emerald-400', to: 'to-emerald-600' },
      blue: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-600', border: 'border-blue-200', from: 'from-blue-400', to: 'to-blue-600' },
      amber: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'text-amber-600', border: 'border-amber-200', from: 'from-amber-400', to: 'to-amber-600' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'text-purple-600', border: 'border-purple-200', from: 'from-purple-400', to: 'to-purple-600' },
      red: { bg: 'bg-red-50', text: 'text-red-700', icon: 'text-red-600', border: 'border-red-200', from: 'from-red-400', to: 'to-red-600' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: 'text-indigo-600', border: 'border-indigo-200', from: 'from-indigo-400', to: 'to-indigo-600' }
    };
    return colors[color] || colors.emerald;
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'recommendation': return Sprout;
      case 'disease_check': return Microscope;
      case 'listing': return ShoppingCart;
      case 'scheme': return Building;
      default: return Activity;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'pending': return Clock;
      case 'failed': return AlertCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'pending': return 'text-amber-500';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Simulate weather data loading
    setTimeout(() => {
      setWeather({
        temperature: 28,
        condition: 'Partly Cloudy',
        humidity: 65,
        windSpeed: 12,
        icon: Cloud
      });
      setIsLoading(false);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
                {getGreeting()}, {user?.name || 'Farmer'}! 👋
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl">
                Welcome back to your smart farming dashboard. Here's what's happening on your farm today.
              </p>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6 lg:mt-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Quick search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm"
                />
              </div>
              <button className="relative p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Weather Widget & Stats Row */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Weather Widget */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium opacity-90">Today's Weather</h3>
                  <MapPin className="w-4 h-4 opacity-75" />
                </div>
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-white/20 rounded mb-2"></div>
                    <div className="h-4 bg-white/20 rounded w-2/3"></div>
                  </div>
                ) : weather ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <weather.icon className="w-12 h-12 mr-3" />
                        <div>
                          <div className="text-3xl font-bold">{weather.temperature}°C</div>
                          <div className="text-sm opacity-90">{weather.condition}</div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <Droplets className="w-4 h-4 mr-2" />
                        <span>{weather.humidity}%</span>
                      </div>
                      <div className="flex items-center">
                        <Wind className="w-4 h-4 mr-2" />
                        <span>{weather.windSpeed} km/h</span>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Sprout className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    +8% this week
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.recommendations}</div>
                <div className="text-sm text-gray-600">Recommendations</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Microscope className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    +15% this week
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.diseaseChecks}</div>
                <div className="text-sm text-gray-600">Disease Checks</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <ShoppingCart className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                    -5% this week
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.listings}</div>
                <div className="text-sm text-gray-600">Active Listings</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Building className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                    +20% this week
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.schemesApplied}</div>
                <div className="text-sm text-gray-600">Schemes Applied</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    +{stats.monthlyGrowth}% growth
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 shadow-lg text-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Award className="w-5 h-5" />
                  </div>
                  <Star className="w-5 h-5 text-yellow-300" />
                </div>
                <div className="text-2xl font-bold">Premium</div>
                <div className="text-sm opacity-90">Farm Status</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
            <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const colors = getColorClasses(action.color);
              const Icon = action.icon;

              return (
                <Link
                  key={index}
                  to={action.link}
                  className="group relative bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  {/* Gradient Border Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${colors.from} ${colors.to} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 ${colors.bg} rounded-xl ${colors.icon} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex items-center space-x-2">
                        {action.badge && (
                          <span className={`text-xs font-medium ${colors.text} ${colors.bg} px-2 py-1 rounded-full`}>
                            {action.badge}
                          </span>
                        )}
                        {action.trend && (
                          <div className={`flex items-center text-xs font-medium ${
                            action.trend.isPositive ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {action.trend.isPositive ? (
                              <ArrowUp className="w-3 h-3 mr-1" />
                            ) : (
                              <ArrowDown className="w-3 h-3 mr-1" />
                            )}
                            {action.trend.value}%
                          </div>
                        )}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-600 group-hover:to-blue-600 transition-all duration-300">
                      {action.title}
                    </h3>

                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {action.description}
                    </p>

                    <div className="flex items-center text-emerald-600 text-sm font-medium group-hover:text-emerald-700 transition-colors">
                      Get Started
                      <ArrowUp className="ml-2 w-4 h-4 rotate-45 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity & Quick Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                  <button className="text-sm text-gray-500 hover:text-gray-700">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {recentActivities.map((activity) => {
                  const ActivityIcon = getActivityIcon(activity.type);
                  const StatusIcon = getStatusIcon(activity.status);

                  return (
                    <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-xl ${getColorClasses(activity.type).bg} ${getColorClasses(activity.type).icon}`}>
                          <ActivityIcon className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                                {activity.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {activity.description}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {activity.timestamp}
                                </span>
                                <span className={`flex items-center ${getStatusColor(activity.status)}`}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {activity.status}
                                </span>
                              </div>
                            </div>

                            <button className="ml-4 text-gray-400 hover:text-gray-600">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 border-t border-gray-100">
                <button className="w-full text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                  View All Activities
                </button>
              </div>
            </div>
          </div>

          {/* Quick Info Panel */}
          <div className="space-y-6">
            {/* Farm Tips */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-emerald-200 rounded-lg">
                  <Zap className="w-5 h-5 text-emerald-700" />
                </div>
                <h3 className="ml-3 font-semibold text-emerald-900">Today's Farm Tip</h3>
              </div>
              <p className="text-emerald-800 text-sm leading-relaxed mb-3">
                Based on current weather conditions, it's an ideal time for transplanting rice seedlings.
                Ensure proper water management for better root development.
              </p>
              <button className="text-sm font-medium text-emerald-700 hover:text-emerald-800 flex items-center">
                Learn more
                <ArrowUp className="ml-1 w-3 h-3 rotate-45" />
              </button>
            </div>

            {/* Upcoming Tasks */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center mb-4">
                <Calendar className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Upcoming Tasks</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Apply fertilizer to wheat field</p>
                    <p className="text-xs text-gray-600">Tomorrow morning</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Check soil moisture levels</p>
                    <p className="text-xs text-gray-600">In 2 days</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Marketplace listing renewal</p>
                    <p className="text-xs text-gray-600">In 5 days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Help */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center mb-4">
                <Eye className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="font-semibold text-blue-900">Need Help?</h3>
              </div>
              <p className="text-blue-800 text-sm leading-relaxed mb-4">
                Get instant support from our agricultural experts and AI assistant.
              </p>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Chat with Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;