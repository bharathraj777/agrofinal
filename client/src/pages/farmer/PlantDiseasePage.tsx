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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState<DiseasePrediction | null>(null);
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState('auto');
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
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
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Plant Disease Detection</h1>
        <p className="text-lg text-gray-600">
          Upload an image of your plant to detect diseases and get treatment recommendations using our AI-powered system.
        </p>
      </div>

      {/* Model Selection */}
      {availableModels.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-primary-600" />
            Detection Model
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="input"
              >
                <option value="auto">Auto (Recommended)</option>
                {availableModels.map((model, index) => (
                  <option key={index} value={model.name}>
                    {model.name} ({(model.accuracy * 100).toFixed(1)}% accuracy)
                  </option>
                ))}
              </select>
            </div>

            {modelInfo && (
              <div className="md:col-span-2">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Current Model:</strong> {modelInfo.name}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    <strong>Architecture:</strong> {modelInfo.architecture}
                  </p>
                  <p className="text-sm text-blue-700">
                    <strong>Description:</strong> {modelInfo.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Plant Image</h2>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              selectedFile ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {previewUrl ? (
              <div className="space-y-4">
                <img
                  src={previewUrl}
                  alt="Plant for analysis"
                  className="mx-auto max-h-64 rounded-lg shadow"
                />
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={resetAnalysis}
                    className="btn-outline"
                  >
                    Upload Different Image
                  </button>
                  <button
                    onClick={analyzeImage}
                    disabled={isAnalyzing}
                    className="btn-primary"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Disease'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">Drop your image here</p>
                  <p className="text-sm text-gray-500">or click to browse</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary"
                >
                  Select Image
                </button>
                <div className="text-xs text-gray-500">
                  Supports: JPG, PNG, GIF, WebP (Max 5MB)
                </div>
              </div>
            )}
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