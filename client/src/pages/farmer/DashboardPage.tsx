import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  TrendingUp,
  TrendingDown,
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
  Eye,
  Leaf,
  Heart,
  DollarSign,
  Package,
  Settings,
  Download,
  RefreshCw,
  Filter,
  Search,
  Bell,
  User,
  Home,
  Tractor,
  Wheat,
  TreePine,
  Flower
} from 'lucide-react';

interface FarmMetric {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ElementType;
  color: string;
  unit?: string;
}

interface CropData {
  name: string;
  health: number;
  growth: number;
  yield: number;
  status: 'healthy' | 'warning' | 'critical';
  area: string;
  plantedDate: string;
  expectedHarvest: string;
}

interface WeatherForecast {
  day: string;
  temp: number;
  condition: string;
  icon: React.ElementType;
  precipitation: number;
}

interface TaskItem {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  category: 'planting' | 'harvesting' | 'maintenance' | 'monitoring';
  status: 'pending' | 'in-progress' | 'completed';
}

interface MarketInsight {
  crop: string;
  currentPrice: number;
  priceChange: number;
  trend: 'up' | 'down' | 'stable';
  demand: 'high' | 'medium' | 'low';
  recommendation: 'sell' | 'hold' | 'buy';
}

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedTimeRange, setSelectedTimeRange] = useState('month');
  const [isLoading, setIsLoading] = useState(false);

  // Simulated data
  const [farmMetrics] = useState<FarmMetric[]>([
    {
      title: 'Total Farm Revenue',
      value: 456700,
      change: 12.5,
      changeType: 'increase',
      icon: DollarSign,
      color: 'emerald',
      unit: '₹'
    },
    {
      title: 'Active Crops',
      value: 8,
      change: 2,
      changeType: 'increase',
      icon: Sprout,
      color: 'green'
    },
    {
      title: 'Farm Efficiency',
      value: 87,
      change: 5,
      changeType: 'increase',
      icon: Target,
      color: 'blue',
      unit: '%'
    },
    {
      title: 'Soil Health Index',
      value: 92,
      change: -2,
      changeType: 'decrease',
      icon: Leaf,
      color: 'amber',
      unit: '%'
    },
    {
      title: 'Water Usage',
      value: 2450,
      change: -8,
      changeType: 'decrease',
      icon: Droplets,
      color: 'blue',
      unit: 'L'
    },
    {
      title: 'Equipment Status',
      value: 6,
      change: 0,
      changeType: 'neutral',
      icon: Tractor,
      color: 'purple'
    }
  ]);

  const [cropsData] = useState<CropData[]>([
    {
      name: 'Wheat',
      health: 92,
      growth: 78,
      yield: 85,
      status: 'healthy',
      area: '2.5 acres',
      plantedDate: '2024-01-15',
      expectedHarvest: '2024-04-20'
    },
    {
      name: 'Rice',
      health: 78,
      growth: 65,
      yield: 70,
      status: 'warning',
      area: '1.8 acres',
      plantedDate: '2024-02-01',
      expectedHarvest: '2024-05-15'
    },
    {
      name: 'Cotton',
      health: 88,
      growth: 82,
      yield: 90,
      status: 'healthy',
      area: '3.2 acres',
      plantedDate: '2024-01-20',
      expectedHarvest: '2024-06-10'
    },
    {
      name: 'Sugarcane',
      health: 45,
      growth: 38,
      yield: 40,
      status: 'critical',
      area: '1.5 acres',
      plantedDate: '2023-12-10',
      expectedHarvest: '2024-03-30'
    }
  ]);

  const [weatherForecast] = useState<WeatherForecast[]>([
    { day: 'Mon', temp: 28, condition: 'Sunny', icon: Sun, precipitation: 0 },
    { day: 'Tue', temp: 26, condition: 'Partly Cloudy', icon: Cloud, precipitation: 20 },
    { day: 'Wed', temp: 24, condition: 'Rainy', icon: Cloud, precipitation: 80 },
    { day: 'Thu', temp: 25, condition: 'Partly Cloudy', icon: Cloud, precipitation: 30 },
    { day: 'Fri', temp: 27, condition: 'Sunny', icon: Sun, precipitation: 5 },
    { day: 'Sat', temp: 29, condition: 'Sunny', icon: Sun, precipitation: 0 },
    { day: 'Sun', temp: 28, condition: 'Partly Cloudy', icon: Cloud, precipitation: 15 }
  ]);

  const [tasks] = useState<TaskItem[]>([
    {
      id: '1',
      title: 'Apply fertilizer to wheat field',
      priority: 'high',
      dueDate: '2024-03-18',
      category: 'maintenance',
      status: 'pending'
    },
    {
      id: '2',
      title: 'Monitor pest control in cotton field',
      priority: 'medium',
      dueDate: '2024-03-19',
      category: 'monitoring',
      status: 'in-progress'
    },
    {
      id: '3',
      title: 'Prepare rice field for harvest',
      priority: 'high',
      dueDate: '2024-03-20',
      category: 'harvesting',
      status: 'pending'
    },
    {
      id: '4',
      title: 'Soil testing for new planting area',
      priority: 'low',
      dueDate: '2024-03-22',
      category: 'planting',
      status: 'pending'
    }
  ]);

  const [marketInsights] = useState<MarketInsight[]>([
    {
      crop: 'Wheat',
      currentPrice: 2200,
      priceChange: 5.2,
      trend: 'up',
      demand: 'high',
      recommendation: 'sell'
    },
    {
      crop: 'Rice',
      currentPrice: 3200,
      priceChange: -2.1,
      trend: 'down',
      demand: 'medium',
      recommendation: 'hold'
    },
    {
      crop: 'Cotton',
      currentPrice: 6500,
      priceChange: 8.7,
      trend: 'up',
      demand: 'high',
      recommendation: 'sell'
    }
  ]);

  const getMetricColorClasses = (color: string) => {
    const colors: { [key: string]: { bg: string; text: string; border: string } } = {
      emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
      green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
      blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' }
    };
    return colors[color] || colors.emerald;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'planting': return Sprout;
      case 'harvesting': return Wheat;
      case 'maintenance': return Settings;
      case 'monitoring': return Eye;
      default: return Activity;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Activity;
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'sell': return 'text-green-600 bg-green-50';
      case 'hold': return 'text-amber-600 bg-amber-50';
      case 'buy': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Farm Dashboard
            </h1>
            <p className="text-gray-600">
              Comprehensive insights and analytics for your agricultural operations
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6 lg:mt-0">
            {/* Time Range Selector */}
            <div className="flex bg-white rounded-lg border border-gray-200 p-1">
              {['week', 'month', 'quarter', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedTimeRange(range)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    selectedTimeRange === range
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {farmMetrics.map((metric, index) => {
            const Icon = metric.icon;
            const colors = getMetricColorClasses(metric.color);

            return (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${colors.bg} ${colors.text}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className={`flex items-center text-sm font-medium ${
                    metric.changeType === 'increase' ? 'text-green-600' :
                    metric.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {metric.changeType === 'increase' && <ArrowUp className="w-3 h-3 mr-1" />}
                    {metric.changeType === 'decrease' && <ArrowDown className="w-3 h-3 mr-1" />}
                    {Math.abs(metric.change)}%
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {metric.unit === '₹' ? '₹' : ''}{typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                  {metric.unit && metric.unit !== '₹' ? metric.unit : ''}
                </div>
                <div className="text-sm text-gray-600">{metric.title}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Crop Health Overview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Crop Health Overview</h2>
                  <Link to="/farmer/crops" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                    View All Crops
                  </Link>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cropsData.map((crop, index) => (
                    <div key={index} className={`p-4 rounded-xl border ${getStatusColor(crop.status)} hover:shadow-md transition-shadow duration-200`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className="p-2 bg-white rounded-lg mr-3">
                            {crop.name === 'Wheat' && <Wheat className="w-5 h-5 text-amber-600" />}
                            {crop.name === 'Rice' && <Leaf className="w-5 h-5 text-green-600" />}
                            {crop.name === 'Cotton' && <Flower className="w-5 h-5 text-blue-600" />}
                            {crop.name === 'Sugarcane' && <TreePine className="w-5 h-5 text-green-700" />}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{crop.name}</h3>
                            <p className="text-sm text-gray-600">{crop.area}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          crop.status === 'healthy' ? 'bg-green-100 text-green-700' :
                          crop.status === 'warning' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {crop.status}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Health</span>
                            <span className="font-medium">{crop.health}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${crop.health}%`,
                                backgroundColor: crop.health >= 80 ? '#10b981' : crop.health >= 60 ? '#f59e0b' : '#ef4444'
                              }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Growth</span>
                            <span className="font-medium">{crop.growth}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                              style={{ width: `${crop.growth}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Expected Yield</span>
                            <span className="font-medium">{crop.yield}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 bg-emerald-500 rounded-full transition-all duration-300"
                              style={{ width: `${crop.yield}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                        Harvest: {new Date(crop.expectedHarvest).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Weather & Tasks */}
          <div className="space-y-6">
            {/* Weather Forecast */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">7-Day Forecast</h2>
                <Cloud className="w-5 h-5 text-blue-500" />
              </div>

              <div className="space-y-3">
                {weatherForecast.map((day, index) => {
                  const Icon = day.icon;
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex items-center">
                        <Icon className="w-5 h-5 text-blue-500 mr-3" />
                        <span className="text-sm font-medium text-gray-900 w-12">{day.day}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-semibold text-gray-900">{day.temp}°C</span>
                        {day.precipitation > 0 && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                            {day.precipitation}%
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Tasks</h2>
                <Link to="/farmer/tasks" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {tasks.map((task) => {
                  const CategoryIcon = getCategoryIcon(task.category);
                  return (
                    <div key={task.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${getPriorityColor(task.priority)} mt-1`}>
                          <CategoryIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 mb-1">{task.title}</p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                            <span className={`px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Market Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Market Insights</h2>
                <Link to="/farmer/marketplace" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                  View Marketplace
                </Link>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {marketInsights.map((insight, index) => {
                  const TrendIcon = getTrendIcon(insight.trend);
                  return (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{insight.crop}</h3>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getRecommendationColor(insight.recommendation)}`}>
                          {insight.recommendation.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-bold text-gray-900">
                            ₹{insight.currentPrice}/quintal
                          </span>
                          <div className={`flex items-center text-sm font-medium ${
                            insight.trend === 'up' ? 'text-green-600' :
                            insight.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            <TrendIcon className="w-4 h-4 mr-1" />
                            {insight.priceChange}%
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          Demand: <span className={`font-medium ${
                            insight.demand === 'high' ? 'text-green-600' :
                            insight.demand === 'medium' ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {insight.demand}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <Link to="/farmer/plant-disease" className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors duration-200">
                  <Microscope className="w-8 h-8 text-blue-600 mb-2" />
                  <h3 className="font-semibold text-gray-900 text-sm">Disease Check</h3>
                  <p className="text-xs text-gray-600 mt-1">Scan plant health</p>
                </Link>

                <Link to="/farmer/recommendations" className="p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors duration-200">
                  <Sprout className="w-8 h-8 text-emerald-600 mb-2" />
                  <h3 className="font-semibold text-gray-900 text-sm">Get Advice</h3>
                  <p className="text-xs text-gray-600 mt-1">AI recommendations</p>
                </Link>

                <Link to="/farmer/schemes" className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors duration-200">
                  <Building className="w-8 h-8 text-purple-600 mb-2" />
                  <h3 className="font-semibold text-gray-900 text-sm">Schemes</h3>
                  <p className="text-xs text-gray-600 mt-1">Govt. benefits</p>
                </Link>

                <Link to="/farmer/marketplace" className="p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors duration-200">
                  <ShoppingCart className="w-8 h-8 text-amber-600 mb-2" />
                  <h3 className="font-semibold text-gray-900 text-sm">Marketplace</h3>
                  <p className="text-xs text-gray-600 mt-1">Buy & sell</p>
                </Link>

                <Link to="/farmer/price-prediction" className="p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors duration-200">
                  <BarChart3 className="w-8 h-8 text-red-600 mb-2" />
                  <h3 className="font-semibold text-gray-900 text-sm">Price Predict</h3>
                  <p className="text-xs text-gray-600 mt-1">Market analysis</p>
                </Link>

                <Link to="/farmer/insights" className="p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors duration-200">
                  <Activity className="w-8 h-8 text-indigo-600 mb-2" />
                  <h3 className="font-semibold text-gray-900 text-sm">Analytics</h3>
                  <p className="text-xs text-gray-600 mt-1">Farm insights</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;