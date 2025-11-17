import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
  Upload,
  Camera,
  AlertCircle,
  CheckCircle,
  Info,
  Loader2,
  Brain,
  Target,
  Microscope,
  Zap,
  Heart,
  Star,
  Clock,
  History,
  Settings,
  RefreshCw,
  Download,
  Share2,
  ZoomIn,
  Image as ImageIcon,
  X,
  ChevronRight,
  Sparkles,
  Shield,
  Bug,
  Droplets,
  Sun,
  Leaf,
  TreePine,
  Flower,
  Apple
} from 'lucide-react';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

interface DiseasePrediction {
  disease: string;
  confidence: number;
  recommendations: string[];
  treatments: {
    organic: string[];
    chemical: string[];
  };
  prevention: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ModelInfo {
  name: string;
  accuracy: number;
  inputSize: number[];
  classes: string[];
  architecture: string;
  description: string;
  recommendedFor: string[];
}

const PlantDiseasePage: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState<DiseasePrediction | null>(null);
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState('auto');
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [history, setHistory] = useState<DiseasePrediction[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    fetchAvailableModels();
  }, []);

  const fetchAvailableModels = async () => {
    try {
      const response = await api.get('/plant-disease/models');
      setAvailableModels(response.data.data.availableModels);
      setModelInfo(response.data.data.currentModel);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPrediction(null);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const mockEvent = { target: { files: [file] } } as any;
      handleFileSelect(mockEvent);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const analyzeImage = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('modelName', selectedModel);

      const response = await api.post('/plant-disease/detect', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setPrediction(response.data.data.prediction);
      setModelInfo(response.data.data.modelInfo);
      toast.success('Disease analysis completed successfully!');
    } catch (error: any) {
      console.error('Disease analysis failed:', error);
      toast.error(error.response?.data?.error || 'Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[severity as keyof typeof colors] || colors.low;
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low':
        return <CheckCircle className="w-4 h-4" />;
      case 'medium':
        return <Info className="w-4 h-4" />;
      case 'high':
        return <AlertCircle className="w-4 h-4" />;
      case 'critical':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    if (confidence >= 0.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setPrediction(null);
    setIsAnalyzing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

    return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
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
            <div className="p-4 bg-blue-100 rounded-2xl">
              <Microscope className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            AI Plant Disease Detection
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Upload images of your plants for instant disease detection and treatment recommendations powered by advanced AI
          </p>
        </div>

      {/* Model Selection */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Brain className="w-6 h-6 mr-3 text-blue-600" />
                AI Detection Models
              </h3>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Detection Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="auto">🤖 Auto (Recommended)</option>
                  {availableModels.map((model, index) => (
                    <option key={index} value={model.name}>
                      🧠 {model.name} ({(model.accuracy * 100).toFixed(1)}% accuracy)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {modelInfo && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Brain className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 text-lg mb-2">{modelInfo.name}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Architecture:</span>
                        <span className="font-medium text-blue-900 ml-1">{modelInfo.architecture}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Accuracy:</span>
                        <span className="font-medium text-blue-900 ml-1">{(model.accuracy * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Classes:</span>
                        <span className="font-medium text-blue-900 ml-1">{modelInfo.classes?.length || 0}</span>
                      </div>
                    </div>
                    <p className="text-blue-800 mt-3">{modelInfo.description}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Upload Plant Image</h2>
              </div>

              <div className="p-6">
                <div
                  className={`relative border-3 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                    selectedFile
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50'
                      : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  {previewUrl ? (
                    <div className="space-y-6">
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt="Plant for analysis"
                          className="mx-auto max-h-80 rounded-xl shadow-lg object-cover"
                        />
                        <button
                          onClick={() => setPreviewUrl('')}
                          className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                        <button
                          onClick={resetAnalysis}
                          className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                          <Upload className="w-4 h-4" />
                          Choose Different Image
                        </button>
                        <button
                          onClick={analyzeImage}
                          disabled={isAnalyzing}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Microscope className="w-4 h-4" />
                              Analyze Disease
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-gray-900 mb-2">Drop your plant image here</p>
                        <p className="text-gray-600">or click to browse from your device</p>
                      </div>
                      <div className="flex flex-col items-center space-y-3">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                        >
                          <Camera className="w-4 h-4" />
                          Select Image
                        </button>
                        <div className="text-xs text-gray-500 text-center">
                          <p>Supports: JPG, PNG, GIF, WebP</p>
                          <p>Maximum file size: 5MB</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Instructions */}
          {!prediction && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-primary-600" />
                How to Get Best Results
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  Take clear photos in good lighting
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  Include both affected and healthy areas
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  Use natural lighting when possible
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  Focus on specific symptoms or patterns
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  Capture leaf details and any visible damage
                </li>
              </ul>
            </div>
          )}

          {/* Prediction Results */}
          {prediction && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Results</h3>

              {/* Disease Info */}
              <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {getSeverityIcon(prediction.severity)}
                    <span className="ml-2 text-lg font-medium text-gray-900">
                      {prediction.disease}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(prediction.severity)}`}>
                    {prediction.severity.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Confidence</span>
                  <span className={`font-medium ${getConfidenceColor(prediction.confidence)}`}>
                    {(prediction.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Recommendations */}
              {prediction.recommendations.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {prediction.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Treatments */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Treatment Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-green-800 mb-2 bg-green-50 px-2 py-1 rounded">
                      Organic Methods
                    </h5>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {prediction.treatments.organic.map((treatment, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          {treatment}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-blue-800 mb-2 bg-blue-50 px-2 py-1 rounded">
                      Chemical Methods
                    </h5>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {prediction.treatments.chemical.map((treatment, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          {treatment}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Prevention */}
              {prediction.prevention.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Prevention Tips</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {prediction.prevention.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <Info className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Camera Access */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-outline flex items-center justify-center"
          >
            <Camera className="w-4 h-4 mr-2" />
            Use Camera
          </button>
          <button
            onClick={() => window.open('/farmer/recommendations', '_blank')}
            className="btn-outline flex items-center justify-center"
          >
            <Brain className="w-4 h-4 mr-2" />
            Crop Recommendations
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlantDiseasePage;