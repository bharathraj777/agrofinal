import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
  Sprout,
  MapPin,
  Droplets,
  Sun,
  Wind,
  Thermometer,
  BarChart3,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronRight,
  ChevronLeft,
  Search,
  Filter,
  Star,
  Clock,
  Calendar,
  Award,
  Zap,
  Target,
  Leaf,
  Wheat,
  TreePine,
  Flower,
  Apple,
  Carrot,
  Corn,
  RefreshCw,
  Download,
  Share2,
  Heart,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface FarmData {
  location: string;
  soilType: string;
  soilPH: number;
  rainfall: number;
  temperature: number;
  humidity: number;
  season: string;
  farmSize: string;
  irrigation: boolean;
  organic: boolean;
  previousCrop: string;
}

interface CropRecommendation {
  id: string;
  name: string;
  scientificName: string;
  score: number;
  matchReason: string[];
  expectedYield: string;
  growingPeriod: string;
  waterRequirement: 'Low' | 'Medium' | 'High';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  profitability: 'Low' | 'Medium' | 'High';
  icon: React.ElementType;
  color: string;
  advantages: string[];
  considerations: string[];
  marketPrice: number;
  marketTrend: 'up' | 'down' | 'stable';
}

const CropRecommendationPage: React.FC = () => {
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<CropRecommendation | null>(null);

  const [farmData, setFarmData] = useState<FarmData>({
    location: '',
    soilType: '',
    soilPH: 7,
    rainfall: 1000,
    temperature: 25,
    humidity: 60,
    season: '',
    farmSize: '',
    irrigation: false,
    organic: false,
    previousCrop: ''
  });

  const soilTypes = [
    { value: 'clayey', label: 'Clayey', description: 'Heavy soil, good water retention' },
    { value: 'loamy', label: 'Loamy', description: 'Balanced soil, ideal for most crops' },
    { value: 'sandy', label: 'Sandy', description: 'Light soil, good drainage' },
    { value: 'black', label: 'Black Cotton', description: 'Fertile soil, good for cotton' },
    { value: 'red', label: 'Red Soil', description: 'Iron-rich, good for root crops' }
  ];

  const seasons = [
    { value: 'kharif', label: 'Kharif', description: 'Monsoon season (June-Oct)' },
    { value: 'rabi', label: 'Rabi', description: 'Winter season (Oct-March)' },
    { value: 'zaid', label: 'Zaid', description: 'Summer season (March-June)' }
  ];

  const mockRecommendations: CropRecommendation[] = [
    {
      id: '1',
      name: 'Wheat',
      scientificName: 'Triticum aestivum',
      score: 92,
      matchReason: ['Perfect soil pH match', 'Optimal temperature range', 'High market demand', 'Suitable for your farm size'],
      expectedYield: '25-30 quintals/hectare',
      growingPeriod: '120-150 days',
      waterRequirement: 'Medium',
      difficulty: 'Easy',
      profitability: 'High',
      icon: Wheat,
      color: 'amber',
      advantages: ['High market price', 'Low maintenance', 'Good storage life', 'Multiple selling options'],
      considerations: ['Requires moderate fertilizer', 'Susceptible to rust diseases'],
      marketPrice: 2200,
      marketTrend: 'up'
    },
    {
      id: '2',
      name: 'Rice',
      scientificName: 'Oryza sativa',
      score: 88,
      matchReason: ['Excellent water availability', 'Suitable climate', 'Good yield potential', 'Stable market'],
      expectedYield: '30-35 quintals/hectare',
      growingPeriod: '90-120 days',
      waterRequirement: 'High',
      difficulty: 'Medium',
      profitability: 'High',
      icon: Leaf,
      color: 'green',
      advantages: ['High yield', 'Staple food demand', 'Government support', 'Good export potential'],
      considerations: ['High water requirement', 'Labor intensive', 'Risk of waterlogging'],
      marketPrice: 3200,
      marketTrend: 'stable'
    },
    {
      id: '3',
      name: 'Cotton',
      scientificName: 'Gossypium hirsutum',
      score: 85,
      matchReason: ['Ideal soil type', 'Favorable climate', 'Good profit margins', 'Government incentives'],
      expectedYield: '12-15 quintals/hectare',
      growingPeriod: '150-180 days',
      waterRequirement: 'Medium',
      difficulty: 'Hard',
      profitability: 'High',
      icon: Flower,
      color: 'blue',
      advantages: ['High profit margins', 'Long growing season', 'Industrial demand', 'Export opportunities'],
      considerations: ['Requires intensive management', 'Pest susceptible', 'High initial cost'],
      marketPrice: 6500,
      marketTrend: 'up'
    },
    {
      id: '4',
      name: 'Sugarcane',
      scientificName: 'Saccharum officinarum',
      score: 78,
      matchReason: ['Suitable soil conditions', 'Good water availability', 'Long-term returns', 'Industrial demand'],
      expectedYield: '70-80 tonnes/hectare',
      growingPeriod: '10-12 months',
      waterRequirement: 'High',
      difficulty: 'Medium',
      profitability: 'Medium',
      icon: TreePine,
      color: 'emerald',
      advantages: ['High yield', 'Long harvest window', 'Industrial contracts', 'By-product income'],
      considerations: ['Long growing period', 'High labor requirement', 'Specialized equipment needed'],
      marketPrice: 2800,
      marketTrend: 'down'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-50';
      case 'Medium': return 'text-amber-600 bg-amber-50';
      case 'Hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getProfitabilityColor = (profitability: string) => {
    switch (profitability) {
      case 'High': return 'text-emerald-600 bg-emerald-50';
      case 'Medium': return 'text-blue-600 bg-blue-50';
      case 'Low': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getWaterRequirementIcon = (requirement: string) => {
    switch (requirement) {
      case 'Low': return Droplets;
      case 'Medium': return Droplets;
      case 'High': return Droplets;
      default: return Droplets;
    }
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateRecommendations = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setRecommendations(mockRecommendations);
      setCurrentStep(4);
      setIsAnalyzing(false);
    }, 3000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-100';
    if (score >= 80) return 'bg-blue-100';
    if (score >= 70) return 'bg-amber-100';
    return 'bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="p-4 bg-emerald-100 rounded-2xl">
              <Sprout className="w-12 h-12 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-4">
            AI-Powered Crop Recommendations
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Get personalized crop suggestions based on your farm conditions, soil analysis, and market trends
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  step < currentStep ? 'bg-emerald-600 text-white' :
                  step === currentStep ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 transition-all duration-300 ${
                    step < currentStep ? 'bg-emerald-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-12 mt-2">
            <span className={`text-sm font-medium ${currentStep >= 1 ? 'text-emerald-600' : 'text-gray-500'}`}>Location</span>
            <span className={`text-sm font-medium ${currentStep >= 2 ? 'text-emerald-600' : 'text-gray-500'}`}>Farm Details</span>
            <span className={`text-sm font-medium ${currentStep >= 3 ? 'text-emerald-600' : 'text-gray-500'}`}>Preferences</span>
            <span className={`text-sm font-medium ${currentStep >= 4 ? 'text-emerald-600' : 'text-gray-500'}`}>Results</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Step 1: Location */}
          {currentStep === 1 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Tell us about your farm location</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Farm Location
                  </label>
                  <input
                    type="text"
                    value={farmData.location}
                    onChange={(e) => setFarmData({ ...farmData, location: e.target.value })}
                    placeholder="Enter your village/city and district"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Soil Type</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {soilTypes.map((soil) => (
                      <button
                        key={soil.value}
                        onClick={() => setFarmData({ ...farmData, soilType: soil.value })}
                        className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                          farmData.soilType === soil.value
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{soil.label}</div>
                        <div className="text-sm text-gray-600 mt-1">{soil.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Soil pH Level: <span className="font-semibold">{farmData.soilPH}</span>
                    </label>
                    <input
                      type="range"
                      min="4"
                      max="9"
                      step="0.1"
                      value={farmData.soilPH}
                      onChange={(e) => setFarmData({ ...farmData, soilPH: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Acidic (4)</span>
                      <span>Neutral (7)</span>
                      <span>Alkaline (9)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Rainfall: <span className="font-semibold">{farmData.rainfall}mm</span>
                    </label>
                    <input
                      type="range"
                      min="200"
                      max="3000"
                      step="50"
                      value={farmData.rainfall}
                      onChange={(e) => setFarmData({ ...farmData, rainfall: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Low (200mm)</span>
                      <span>Medium (1500mm)</span>
                      <span>High (3000mm)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Farm Details */}
          {currentStep === 2 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Farm and Climate Details</h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Average Temperature: <span className="font-semibold">{farmData.temperature}°C</span>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="45"
                      value={farmData.temperature}
                      onChange={(e) => setFarmData({ ...farmData, temperature: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Cool (10°C)</span>
                      <span>Moderate (25°C)</span>
                      <span>Hot (45°C)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Humidity: <span className="font-semibold">{farmData.humidity}%</span>
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="90"
                      value={farmData.humidity}
                      onChange={(e) => setFarmData({ ...farmData, humidity: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Low (20%)</span>
                      <span>Moderate (55%)</span>
                      <span>High (90%)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Growing Season</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {seasons.map((season) => (
                      <button
                        key={season.value}
                        onClick={() => setFarmData({ ...farmData, season: season.value })}
                        className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                          farmData.season === season.value
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{season.label}</div>
                        <div className="text-sm text-gray-600 mt-1">{season.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Farm Size</label>
                  <select
                    value={farmData.farmSize}
                    onChange={(e) => setFarmData({ ...farmData, farmSize: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Select farm size</option>
                    <option value="small">Small (Less than 2 acres)</option>
                    <option value="medium">Medium (2-10 acres)</option>
                    <option value="large">Large (10-50 acres)</option>
                    <option value="very-large">Very Large (More than 50 acres)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Previous Crop</label>
                  <input
                    type="text"
                    value={farmData.previousCrop}
                    onChange={(e) => setFarmData({ ...farmData, previousCrop: e.target.value })}
                    placeholder="What did you grow in the last season?"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {currentStep === 3 && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Farming Preferences</h2>

              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={farmData.irrigation}
                      onChange={(e) => setFarmData({ ...farmData, irrigation: e.target.checked })}
                      className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">I have irrigation facilities</div>
                      <div className="text-sm text-gray-600">Access to reliable water source for farming</div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={farmData.organic}
                      onChange={(e) => setFarmData({ ...farmData, organic: e.target.checked })}
                      className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">I prefer organic farming</div>
                      <div className="text-sm text-gray-600">Natural methods without synthetic fertilizers and pesticides</div>
                    </div>
                  </label>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-emerald-900 mb-2">Ready to get recommendations?</h3>
                      <p className="text-emerald-800 text-sm">
                        Based on your farm data, our AI will analyze multiple factors including soil compatibility,
                        climate suitability, market demand, and profitability potential to suggest the best crops for your farm.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Results */}
          {currentStep === 4 && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Your Crop Recommendations</h2>
                <div className="flex space-x-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {recommendations.map((crop) => {
                  const Icon = crop.icon;
                  return (
                    <div
                      key={crop.id}
                      className="border-2 border-gray-200 rounded-xl p-6 hover:border-emerald-500 transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedRecommendation(crop)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-3 rounded-lg bg-${crop.color}-100`}>
                            <Icon className={`w-6 h-6 text-${crop.color}-600`} />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{crop.name}</h3>
                            <p className="text-sm text-gray-600 italic">{crop.scientificName}</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full ${getScoreBgColor(crop.score)} ${getScoreColor(crop.score)}`}>
                          <span className="font-bold">{crop.score}%</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <div>
                            <div className="text-xs text-gray-500">Expected Yield</div>
                            <div className="text-sm font-semibold">{crop.expectedYield}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <div>
                            <div className="text-xs text-gray-500">Growing Period</div>
                            <div className="text-sm font-semibold">{crop.growingPeriod}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(crop.difficulty)}`}>
                          {crop.difficulty}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getProfitabilityColor(crop.profitability)}`}>
                          {crop.profitability} Profit
                        </span>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700">
                          {crop.waterRequirement} Water
                        </span>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Market Price</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-900">₹{crop.marketPrice}/quintal</span>
                            {crop.marketTrend === 'up' && <ArrowUp className="w-4 h-4 text-green-600" />}
                            {crop.marketTrend === 'down' && <ArrowDown className="w-4 h-4 text-red-600" />}
                            {crop.marketTrend === 'stable' && <Minus className="w-4 h-4 text-gray-600" />}
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <div className="text-sm text-gray-600 mb-2">Why this crop?</div>
                        <ul className="space-y-1">
                          {crop.matchReason.slice(0, 2).map((reason, index) => (
                            <li key={index} className="text-xs text-gray-700 flex items-center">
                              <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex justify-between">
              <button
                onClick={handlePreviousStep}
                disabled={currentStep === 1}
                className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {currentStep < 3 && (
                <button
                  onClick={handleNextStep}
                  className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {currentStep === 3 && (
                <button
                  onClick={generateRecommendations}
                  disabled={isAnalyzing}
                  className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Generate Recommendations
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Selected Recommendation Modal */}
        {selectedRecommendation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <selectedRecommendation.icon className={`w-8 h-8 text-${selectedRecommendation.color}-600`} />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedRecommendation.name}</h3>
                      <p className="text-sm text-gray-600">{selectedRecommendation.scientificName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedRecommendation(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Match Score</div>
                    <div className={`text-2xl font-bold ${getScoreColor(selectedRecommendation.score)}`}>
                      {selectedRecommendation.score}%
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Profitability</div>
                    <div className={`text-2xl font-bold ${getProfitabilityColor(selectedRecommendation.profitability)}`}>
                      {selectedRecommendation.profitability}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Why this crop is recommended for you</h4>
                  <ul className="space-y-2">
                    {selectedRecommendation.matchReason.map((reason, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-3 mt-0.5" />
                        <span className="text-sm text-gray-700">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Advantages</h4>
                  <ul className="space-y-2">
                    {selectedRecommendation.advantages.map((advantage, index) => (
                      <li key={index} className="flex items-start">
                        <Star className="w-4 h-4 text-amber-500 mr-3 mt-0.5" />
                        <span className="text-sm text-gray-700">{advantage}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Things to Consider</h4>
                  <ul className="space-y-2">
                    {selectedRecommendation.considerations.map((consideration, index) => (
                      <li key={index} className="flex items-start">
                        <AlertCircle className="w-4 h-4 text-amber-500 mr-3 mt-0.5" />
                        <span className="text-sm text-gray-700">{consideration}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropRecommendationPage;