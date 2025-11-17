import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
  Building,
  Search,
  Filter,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  Heart,
  TrendingUp,
  Download,
  Share2,
  ChevronRight,
  ChevronLeft,
  X,
  Award,
  Target,
  Zap,
  Shield,
  Info,
  ExternalLink,
  Grid,
  List,
  ArrowUp,
  ArrowDown,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';

interface GovernmentScheme {
  id: string;
  title: string;
  description: string;
  state: string;
  category: string;
  eligibility: string[];
  benefits: string;
  documents: string[];
  applicationSteps: string[];
  applyUrl?: string;
  contactInfo?: {
    phone: string;
    email: string;
    website: string;
  };
  tags: string[];
  deadline?: string;
  amount?: string;
  status: 'open' | 'closing_soon' | 'closed';
  priority: 'high' | 'medium' | 'low';
  applicationCount?: number;
  successRate?: number;
  bookmarked: boolean;
  applied: boolean;
}

interface FilterOptions {
  category: string;
  state: string;
  eligibility: string;
  priority: string;
  status: string;
}

const GovernmentSchemesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScheme, setSelectedScheme] = useState<GovernmentScheme | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'relevance' | 'deadline' | 'amount' | 'popularity'>('relevance');
  const [filters, setFilters] = useState<FilterOptions>({
    category: '',
    state: '',
    eligibility: '',
    priority: '',
    status: ''
  });

  // Mock data - in real app, this would come from API
  const [schemes] = useState<GovernmentScheme[]>([
    {
      id: '1',
      title: 'Pradhan Mantri Kisan Samman Nidhi (PM-Kisan)',
      description: 'Income support of Rs. 6000 per year to farmer families for agricultural activities and domestic needs',
      state: 'All India',
      category: 'subsidy',
      eligibility: [
        'Small and marginal farmers',
        'Land holding up to 2 hectares',
        'Indian citizen',
        'Aadhaar card mandatory'
      ],
      benefits: 'Direct cash transfer of Rs. 6000 in three equal installments',
      documents: [
        'Aadhaar card',
        'Land records',
        'Bank account details',
        'Caste certificate (if applicable)'
      ],
      applicationSteps: [
        'Visit nearest Common Service Center',
        'Submit required documents',
        'Verify details in PM-Kisan portal',
        'Receive DBT transfers'
      ],
      applyUrl: 'https://pmkisan.gov.in',
      contactInfo: {
        phone: '1800115522',
        email: 'pmkisan@gov.in',
        website: 'https://pmkisan.gov.in'
      },
      tags: ['income support', 'small farmers', 'cash transfer', 'central government'],
      amount: '₹6000/year',
      status: 'open',
      priority: 'high',
      applicationCount: 4523400,
      successRate: 78,
      bookmarked: false,
      applied: false
    },
    {
      id: '2',
      title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      description: 'Crop insurance scheme to provide financial support to farmers suffering crop loss due to natural calamities',
      state: 'All India',
      category: 'insurance',
      eligibility: [
        'All farmers including sharecroppers',
        'Tenant farmers with permission of landowner',
        'Cultivation notified area crops'
      ],
      benefits: 'Insurance coverage for crop losses up to 90% of sum insured',
      documents: [
        'Land ownership proof',
        'Aadhaar card',
        'Bank account details',
        'Crop cultivation details'
      ],
      applicationSteps: [
        'Approach bank or insurance company',
        'Submit application with required documents',
        'Pay premium amount',
        'Get insurance coverage'
      ],
      tags: ['crop insurance', 'risk coverage', 'natural calamities', 'financial security'],
      amount: 'Variable (2-15% of sum insured)',
      status: 'open',
      priority: 'high',
      applicationCount: 3820156,
      successRate: 82,
      bookmarked: false,
      applied: false
    },
    {
      id: '3',
      title: 'Maharashtra State Agriculture Credit Card Scheme',
      description: 'Provides credit card facilities to farmers for agricultural operations and allied activities',
      state: 'Maharashtra',
      category: 'loan',
      eligibility: [
        'Resident farmers of Maharashtra',
        'Minimum 1 acre agricultural land',
        'Good credit history',
        'Age between 18-65 years'
      ],
      benefits: 'Credit limit up to Rs. 50,000 with 4% interest rate',
      documents: [
        'Residence proof',
        'Land records',
        'Income certificate',
        'Bank account details'
      ],
      applicationSteps: [
        'Apply at nearest bank branch',
        'Submit application form and documents',
        'Bank verification and approval',
        'Receive credit card'
      ],
      contactInfo: {
        phone: '18002334567',
        email: 'agri@mahabank.gov.in',
        website: 'https://mahabank.gov.in'
      },
      tags: ['agricultural credit', 'loan facility', 'maharashtra', '4% interest'],
      amount: 'Up to ₹50,000',
      status: 'open',
      priority: 'medium',
      applicationCount: 1256780,
      successRate: 75,
      bookmarked: true,
      applied: false
    },
    {
      id: '4',
      title: 'Soil Health Card Scheme',
      description: 'Provides soil health cards to farmers with information about soil nutrient status and recommendations',
      state: 'All India',
      category: 'training',
      eligibility: [
        'All farmers',
        'Land ownership or cultivation rights',
        'Valid agricultural land details'
      ],
      benefits: 'Free soil testing and fertilizer recommendations every 2 years',
      documents: [
        'Land ownership documents',
        'Aadhaar card',
        'Bank account details'
      ],
      applicationSteps: [
        'Register at local agriculture office',
        'Submit land details',
        'Soil sample collection',
        'Receive soil health card'
      ],
      contactInfo: {
        phone: '18001801553',
        email: 'soilhealth@gov.in',
        website: 'https://soilhealth.gov.in'
      },
      tags: ['soil testing', 'fertilizer recommendations', 'soil health', 'free testing'],
      amount: 'Free',
      status: 'open',
      priority: 'medium',
      applicationCount: 8976543,
      successRate: 88,
      bookmarked: false,
      applied: true
    },
    {
      id: '5',
      title: 'National Agriculture Market (e-NAM)',
      description: 'Online trading platform for agricultural commodities to ensure better price discovery',
      state: 'All India',
      category: 'equipment',
      eligibility: [
        'Farmers and traders',
        'Valid agricultural produce',
        'Registered with local mandi'
      ],
      benefits: 'Better price discovery, reduced transaction costs, transparent trading',
      documents: [
        'PAN card',
        'Aadhaar card',
        'Bank account',
        'Mandi registration'
      ],
      applicationSteps: [
        'Register on e-NAM portal',
        'Complete KYC verification',
        'Start online trading',
        'Receive payments directly'
      ],
      applyUrl: 'https://enam.gov.in',
      tags: ['online trading', 'price discovery', 'digital agriculture', 'transparent market'],
      amount: 'No cost',
      status: 'open',
      priority: 'high',
      applicationCount: 24567890,
      successRate: 92,
      bookmarked: false,
      applied: false
    }
  ]);

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'subsidy', label: 'Subsidies' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'loan', label: 'Loans' },
    { value: 'training', label: 'Training & Education' },
    { value: 'equipment', label: 'Equipment & Infrastructure' }
  ];

  const states = [
    { value: '', label: 'All States' },
    { value: 'All India', label: 'All India' },
    { value: 'Maharashtra', label: 'Maharashtra' },
    { value: 'Gujarat', label: 'Gujarat' },
    { value: 'Punjab', label: 'Punjab' },
    { value: 'Haryana', label: 'Haryana' },
    { value: 'Madhya Pradesh', label: 'Madhya Pradesh' }
  ];

  const priorities = [
    { value: '', label: 'All Priorities' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'open', label: 'Open' },
    { value: 'closing_soon', label: 'Closing Soon' },
    { value: 'closed', label: 'Closed' }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'subsidy': return <DollarSign className="w-5 h-5" />;
      case 'insurance': return <Shield className="w-5 h-5" />;
      case 'loan': return <DollarSign className="w-5 h-5" />;
      case 'training': return <Target className="w-5 h-5" />;
      case 'equipment': return <Zap className="w-5 h-5" />;
      default: return <Building className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-green-600 bg-green-50';
      case 'closing_soon': return 'text-amber-600 bg-amber-50';
      case 'closed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-amber-600 bg-amber-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredAndSortedSchemes = useMemo(() => {
    let filtered = schemes;

    // Apply filters
    if (filters.category) {
      filtered = filtered.filter(scheme => scheme.category === filters.category);
    }
    if (filters.state) {
      filtered = filtered.filter(scheme => scheme.state === filters.state);
    }
    if (filters.priority) {
      filtered = filtered.filter(scheme => scheme.priority === filters.priority);
    }
    if (filters.status) {
      filtered = filtered.filter(scheme => scheme.status === filters.status);
    }
    if (searchQuery) {
      filtered = filtered.filter(scheme =>
        scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scheme.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scheme.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          return (a.deadline || '').localeCompare(b.deadline || '');
        case 'amount':
          return (b.amount || '').localeCompare(a.amount || '');
        case 'popularity':
          return (b.applicationCount || 0) - (a.applicationCount || 0);
        default: // relevance
          return 0;
      }
    });
  }, [schemes, filters, searchQuery, sortBy]);

  const toggleBookmark = (schemeId: string) => {
    // In real app, this would call API
    console.log('Toggle bookmark:', schemeId);
  };

  const handleApply = (scheme: GovernmentScheme) => {
    // In real app, this would open application form or redirect
    console.log('Apply for scheme:', scheme.id);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      state: '',
      eligibility: '',
      priority: '',
      status: ''
    });
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="p-4 bg-purple-100 rounded-2xl">
              <Building className="w-12 h-12 text-purple-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Government Schemes
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover and apply for agricultural schemes, subsidies, and financial support from government
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search schemes, eligibility, benefits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                />
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-purple-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white text-purple-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <select
                value={filters.state}
                onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {states.map(state => (
                  <option key={state.value} value={state.value}>{state.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>{priority.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="relevance">Relevance</option>
                <option value="deadline">Deadline</option>
                <option value="amount">Amount</option>
                <option value="popularity">Popularity</option>
              </select>
            </div>

            <div className="flex items-center">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredAndSortedSchemes.length}</span> schemes
          </p>
          <p className="text-sm text-gray-500">
            {filteredAndSortedSchemes.filter(s => s.status === 'open').length} schemes available
          </p>
        </div>

        {/* Schemes Grid/List */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
          {filteredAndSortedSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              {viewMode === 'grid' ? (
                <>
                  {/* Card Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`p-2 rounded-lg ${getStatusColor(scheme.status)}`}>
                            {getCategoryIcon(scheme.category)}
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(scheme.priority)}`}>
                            {scheme.priority.toUpperCase()}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{scheme.title}</h3>
                      </div>
                      <button
                        onClick={() => toggleBookmark(scheme.id)}
                        className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                      >
                        {scheme.bookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-3">{scheme.description}</p>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Key Details</h4>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">{scheme.state}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">{scheme.applicationCount?.toLocaleString()} applications</span>
                          </div>
                          {scheme.amount && (
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-600">{scheme.amount}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Eligibility</h4>
                        <div className="space-y-2">
                          {scheme.eligibility.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex items-start">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{item}</span>
                            </div>
                          ))}
                          {scheme.eligibility.length > 3 && (
                            <p className="text-sm text-purple-600 font-medium">+{scheme.eligibility.length - 3} more criteria</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Benefits</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">{scheme.benefits}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedScheme(scheme)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
                      >
                        <Info className="w-4 h-4" />
                        View Details
                      </button>
                      <button
                        onClick={() => handleApply(scheme)}
                        disabled={scheme.applied}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-emerald-600 text-white rounded-lg hover:from-purple-700 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {scheme.applied ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Applied
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-4 h-4" />
                            Apply Now
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* List View */
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${getStatusColor(scheme.status)}`}>
                      {getCategoryIcon(scheme.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{scheme.title}</h3>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(scheme.priority)}`}>
                            {scheme.priority.toUpperCase()}
                          </span>
                          <button
                            onClick={() => toggleBookmark(scheme.id)}
                            className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                          >
                            {scheme.bookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{scheme.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                          <span>{scheme.state}</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                          <span>{scheme.amount || 'Variable'}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 text-gray-400 mr-2" />
                          <span>{scheme.applicationCount?.toLocaleString()} applicants</span>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => setSelectedScheme(scheme)}
                          className="flex-1 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleApply(scheme)}
                          disabled={scheme.applied}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-emerald-600 text-white rounded-lg hover:from-purple-700 hover:to-emerald-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {scheme.applied ? 'Applied' : 'Apply Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredAndSortedSchemes.length === 0 && (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No schemes found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search terms to find relevant schemes</p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Scheme Details Modal */}
        {selectedScheme && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <div className={`p-3 rounded-lg mr-3 ${getStatusColor(selectedScheme.status)}`}>
                      {getCategoryIcon(selectedScheme.category)}
                    </div>
                    {selectedScheme.title}
                  </h2>
                  <button
                    onClick={() => setSelectedScheme(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-600">{selectedScheme.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Eligibility Criteria</h3>
                  <ul className="space-y-2">
                    {selectedScheme.eligibility.map((criteria, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{criteria}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedScheme.documents.map((doc, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <FileText className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-700">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Application Process</h3>
                  <div className="space-y-3">
                    {selectedScheme.applicationSteps.map((step, index) => (
                      <div key={index} className="flex items-start">
                        <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold mr-3 flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-700">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                  {selectedScheme.contactInfo && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-blue-700 mb-1">Phone</p>
                        <p className="font-medium text-blue-900">{selectedScheme.contactInfo.phone}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm text-green-700 mb-1">Email</p>
                        <p className="font-medium text-green-900">{selectedScheme.contactInfo.email}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <p className="text-sm text-purple-700 mb-1">Website</p>
                        <p className="font-medium text-purple-900 break-all">{selectedScheme.contactInfo.website}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GovernmentSchemesPage;
