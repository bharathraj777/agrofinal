import { Request, Response } from 'express';
import plantDiseaseService from '../services/plantDiseaseService';
import { AuthRequest, AppError, asyncHandler } from '../middleware';
import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Detect plant disease from uploaded image
export const detectDisease = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    throw new AppError('Image file is required', 400);
  }

  const { modelName } = req.body;

  try {
    const prediction = await plantDiseaseService.predictDisease(
      req.file.buffer,
      modelName || 'auto'
    );

    res.json({
      success: true,
      data: {
        prediction,
        modelInfo: plantDiseaseService.getModelInfo(),
        uploadedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Disease detection error:', error);
    throw new AppError('Failed to process image for disease detection', 500);
  }
});

// Get available models
export const getAvailableModels = asyncHandler(async (req: Request, res: Response) => {
  try {
    const models = await plantDiseaseService.getAvailableModels();
    const currentModel = plantDiseaseService.getModelInfo();

    res.json({
      success: true,
      data: {
        availableModels: models,
        currentModel,
        recommendation: getRecommendedModel()
      }
    });
  } catch (error) {
    console.error('Failed to get available models:', error);
    throw new AppError('Failed to get available models', 500);
  }
});

// Train custom model
export const trainModel = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { epochs = 50, trainingDataPath } = req.body;

  // Only admin users can train models
  if (req.user?.role !== 'admin') {
    throw new AppError('Only admin users can train models', 403);
  }

  try {
    const modelInfo = await plantDiseaseService.trainCustomModel(
      trainingDataPath || 'default',
      parseInt(epochs)
    );

    res.json({
      success: true,
      message: 'Model training completed successfully',
      data: {
        modelInfo,
        trainedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Model training error:', error);
    throw new AppError('Failed to train model', 500);
  }
});

// Evaluate model performance
export const evaluateModel = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Only admin users can evaluate models
  if (req.user?.role !== 'admin') {
    throw new AppError('Only admin users can evaluate models', 403);
  }

  const { testDataPath } = req.body;

  try {
    const evaluation = await plantDiseaseService.evaluateModel(testDataPath);

    res.json({
      success: true,
      data: {
        evaluation,
        evaluatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Model evaluation error:', error);
    throw new AppError('Failed to evaluate model', 500);
  }
});

// Get disease information
export const getDiseaseInfo = asyncHandler(async (req: Request, res: Response) => {
  const { disease } = req.params;

  const diseaseDatabase = {
    'Bacterial Spot': {
      description: 'Bacterial spot is a common disease affecting tomatoes, peppers, and other plants. It appears as small, water-soaked lesions that enlarge and become dark brown to black.',
      causes: ['Xanthomonas bacteria', 'Warm, humid weather', 'Overhead irrigation', 'Poor air circulation'],
      symptoms: [
        'Small, water-soaked spots on leaves',
        'Spots enlarge to 1-3mm diameter',
        'Lesions have dark brown to black centers',
        'Yellow halo around spots',
        'Leaf drop in severe cases'
      ],
      affectedPlants: ['Tomato', 'Pepper', 'Eggplant'],
      spreadMethods: ['Rain splash', 'Wind', 'Contaminated tools', 'Infected seeds']
    },
    'Early Blight': {
      description: 'Early blight is a fungal disease that affects tomatoes and potatoes. It typically appears after periods of wet weather.',
      causes: ['Phytophthora infestans fungus', 'Cool, wet conditions', 'High humidity', 'Poor air circulation'],
      symptoms: [
        'Dark brown spots on older leaves',
        'Lesions with target-like appearance',
        'White mold growth on underside of spots',
        'Rapid spread in wet conditions',
        'Plant death in severe cases'
      ],
      affectedPlants: ['Tomato', 'Potato'],
      spreadMethods: ['Wind-borne spores', 'Rain splash', 'Infected plant debris']
    },
    'Late Blight': {
      description: 'Late blight is a devastating disease that caused the Irish potato famine. It affects tomatoes and potatoes.',
      causes: ['Phytophthora infestans', 'Cool, moist conditions', 'High humidity'],
      symptoms: [
        'Large, irregular dark brown spots',
        'Water-soaked lesions',
        'White cottony growth on underside',
        'Rapid plant collapse',
        'Field-wide destruction'
      ],
      affectedPlants: ['Tomato', 'Potato'],
      spreadMethods: ['Wind-borne spores', 'Rain', 'Infected seed tubers']
    },
    'Powdery Mildew': {
      description: 'Powdery mildew is a fungal disease that appears as a white powdery coating on leaves, stems, and flowers.',
      causes: ['Fungal pathogens', 'High humidity', 'Poor air circulation', 'Moderate temperatures'],
      symptoms: [
        'White powdery patches on leaves',
        'Yellowing and curling of affected areas',
        'Stunted growth',
        'Reduced fruit production',
        'Premature leaf drop'
      ],
      affectedPlants: ['Squash', 'Cucumber', 'Melons', 'Roses', 'Grapes'],
      spreadMethods: ['Wind-borne spores', 'Overhead irrigation', 'High humidity']
    },
    'Rust': {
      description: 'Rust diseases get their name from the rust-colored pustules that form on infected plant parts.',
      causes: ['Puccinia fungi', 'Moderate temperatures', 'High humidity'],
      symptoms: [
        'Orange to reddish-brown pustules',
        'Powdery spores that rub off',
        'Yellowing of leaves',
        'Premature leaf drop',
        'Reduced vigor'
      ],
      affectedPlants: ['Wheat', 'Corn', 'Beans', 'Roses', 'Hollyhock'],
      spreadMethods: ['Wind-borne spores', 'Rain splash', 'Infected plant debris']
    },
    'Yellow Leaf Curl Virus': {
      description: 'Yellow leaf curl virus is transmitted by whiteflies and causes significant yield losses.',
      causes: ['Begomovirus', 'Whitefly transmission', 'Infected plants', 'Warm weather'],
      symptoms: [
        'Upward curling of leaves',
        'Yellowing of leaf tissue',
        'Stunted plant growth',
        'Reduced fruit set',
        'Abnormal flower development'
      ],
      affectedPlants: ['Tomato', 'Pepper', 'Cotton', 'Squash'],
      spreadMethods: ['Whiteflies', 'Infected seeds', 'Grafting']
    },
    'Mosaic Virus': {
      description: 'Mosaic viruses cause mottled patterns on leaves and reduce plant productivity.',
      causes: ['Various mosaic viruses', 'Aphid transmission', 'Mechanical damage'],
      symptoms: [
        'Mottled green and yellow patches',
        'Leaf distortion',
        'Stunted growth',
        'Reduced fruit quality',
        'Plant death in severe cases'
      ],
      affectedPlants: ['Tomato', 'Cucumber', 'Tobacco', 'Pepper'],
      spreadMethods: ['Aphids', 'Mechanical damage', 'Infected seeds']
    },
    'Spider Mites': {
      description: 'Spider mites are tiny arachnids that suck plant juices and cause damage.',
      causes: ['Tetranychus urticae', 'Hot, dry conditions', 'Dust', 'Predator imbalance'],
      symptoms: [
        'Tiny yellow or white spots on leaves',
        'Fine webbing on plants',
        'Bronzing of leaves',
        'Leaf drop',
        'Reduced plant vigor'
      ],
      affectedPlants: ['Tomato', 'Cucumber', 'Pepper', 'Beans', 'Strawberries'],
      spreadMethods: ['Wind', 'Movement of plants', 'Infected nursery stock']
    }
  };

  const diseaseInfo = diseaseDatabase[disease as keyof typeof diseaseDatabase];

  if (!diseaseInfo) {
    throw new AppError('Disease information not found', 404);
  }

  res.json({
    success: true,
    data: {
      disease,
      info: diseaseInfo
    }
  });
});

function getRecommendedModel() {
  const models = {
    'MobileNetV2': {
      useCase: 'Best for mobile devices and real-time applications',
      advantages: ['Fast inference', 'Low memory usage', 'Good accuracy'],
      accuracy: '92%'
    },
    'ResNet50': {
      useCase: 'Best for desktop applications and research',
      advantages: ['Highest accuracy', 'Robust features', 'Well-tested'],
      accuracy: '96%'
    },
    'Custom CNN': {
      useCase: 'Best for custom datasets and specific crops',
      advantages: ['Flexible training', 'Optimized for specific data', 'Lightweight'],
      accuracy: '88%'
    },
    'Rule-based': {
      useCase: 'Good fallback and quick diagnosis',
      advantages: ['No ML model required', 'Fast', 'Offline capability'],
      accuracy: '75%'
    }
  };

  return models['MobileNetV2'];
}

// Upload handler middleware
export const uploadImage = upload.single('image');