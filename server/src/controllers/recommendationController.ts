import { Request, Response } from 'express';
import { Crop, RecommendationLog, User, IRecommendationLog } from '../models';
import { AuthRequest, AppError, asyncHandler } from '../middleware';
import mongoose from 'mongoose';
import * as tf from '@tensorflow/tfjs-node';

// Simple crop recommendation algorithm (placeholder for ML model)
class CropRecommendationService {
  private model: tf.LayersModel | null = null;

  // Load or create a simple model
  private async getModel(): Promise<tf.LayersModel> {
    if (!this.model) {
      // Create a simple neural network for demonstration
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [10], units: 64, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 32, activation: 'relu' }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 16, activation: 'relu' }),
          tf.layers.dense({ units: 1, activation: 'sigmoid' })
        ]
      });

      this.model.compile({
        optimizer: 'adam',
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
      });
    }
    return this.model;
  }

  // Encode soil type and season
  private encodeFeatures(features: any): number[] {
    const soilTypeEncoding = {
      'clayey': [1, 0, 0, 0, 0, 0],
      'loamy': [0, 1, 0, 0, 0, 0],
      'sandy': [0, 0, 1, 0, 0, 0],
      'peaty': [0, 0, 0, 1, 0, 0],
      'chalky': [0, 0, 0, 0, 1, 0],
      'silty': [0, 0, 0, 0, 0, 1]
    };

    const seasonEncoding = {
      'kharif': [1, 0, 0, 0, 0, 0],
      'rabi': [0, 1, 0, 0, 0, 0],
      'zaid': [0, 0, 1, 0, 0, 0],
      'summer': [0, 0, 0, 1, 0, 0],
      'winter': [0, 0, 0, 0, 1, 0],
      'monsoon': [0, 0, 0, 0, 0, 1]
    };

    const soilEncoding = soilTypeEncoding[features.soilType as keyof typeof soilTypeEncoding] || [0, 0, 0, 0, 0, 0];
    const seasonEnc = seasonEncoding[features.season as keyof typeof seasonEncoding] || [0, 0, 0, 0, 0, 0];

    // Normalize numeric features to [0, 1]
    const normalizedFeatures = [
      features.N / 200,          // Normalize N (0-200 kg/ha)
      features.P / 150,          // Normalize P (0-150 kg/ha)
      features.K / 200,          // Normalize K (0-200 kg/ha)
      (features.temperature + 50) / 110,  // Normalize temperature (-50 to 60)
      features.humidity / 100,   // Normalize humidity (0-100%)
      features.rainfall / 3000,  // Normalize rainfall (0-3000mm)
      features.ph / 14,          // Normalize pH (0-14)
      ...soilEncoding.slice(0, 1), // Use first soil type encoding
      ...seasonEnc.slice(0, 1),   // Use first season encoding
      features.location ? (features.location.lat + 90) / 180 : 0.5 // Location if available
    ];

    return normalizedFeatures.slice(0, 10); // Ensure exactly 10 features
  }

  // Calculate crop suitability score
  private calculateCropScore(crop: any, inputFeatures: any): number {
    let score = 0;
    let totalWeight = 0;

    // NPK matching
    const npkWeight = 0.3;
    const nScore = this.calculateRangeScore(inputFeatures.N, crop.ideal.N);
    const pScore = this.calculateRangeScore(inputFeatures.P, crop.ideal.P);
    const kScore = this.calculateRangeScore(inputFeatures.K, crop.ideal.K);
    score += (nScore + pScore + kScore) / 3 * npkWeight;
    totalWeight += npkWeight;

    // Environmental factors
    const envWeight = 0.4;
    const tempScore = this.calculateRangeScore(inputFeatures.temperature, crop.ideal.temperature);
    const humidityScore = this.calculateRangeScore(inputFeatures.humidity, crop.ideal.humidity);
    const rainfallScore = this.calculateRangeScore(inputFeatures.rainfall, crop.ideal.rainfall);
    const phScore = this.calculateRangeScore(inputFeatures.ph, crop.ideal.ph);
    score += (tempScore + humidityScore + rainfallScore + phScore) / 4 * envWeight;
    totalWeight += envWeight;

    // Season compatibility
    const seasonWeight = 0.2;
    const seasonScore = crop.ideal.seasons.includes(inputFeatures.season) ? 1 : 0.3;
    score += seasonScore * seasonWeight;
    totalWeight += seasonWeight;

    // Soil type compatibility
    const soilWeight = 0.1;
    const soilScore = crop.soilTypes.includes(inputFeatures.soilType) ? 1 : 0.5;
    score += soilScore * soilWeight;
    totalWeight += soilWeight;

    return score / totalWeight;
  }

  // Calculate how well a value fits within a range
  private calculateRangeScore(value: number, range: [number, number]): number {
    const [min, max] = range;
    if (value >= min && value <= max) {
      return 1;
    }

    const rangeSize = max - min;
    const distance = value < min ? min - value : value - max;

    // Score decreases linearly with distance from range
    return Math.max(0, 1 - (distance / rangeSize));
  }

  // Generate recommendations for given features
  async generateRecommendations(inputFeatures: any, limit: number = 5): Promise<any[]> {
    // Get all active crops
    const crops = await Crop.find({ isActive: true }).lean();

    // Calculate scores for each crop
    const cropScores = crops.map(crop => ({
      crop,
      score: this.calculateCropScore(crop, inputFeatures)
    }));

    // Sort by score (descending) and take top results
    cropScores.sort((a, b) => b.score - a.score);

    return cropScores.slice(0, limit).map(({ crop, score }) => ({
      cropId: crop._id,
      score: Math.max(0.1, Math.min(1, score)), // Clamp between 0.1 and 1
      crop,
      reasoning: this.generateReasoning(crop, inputFeatures, score)
    }));
  }

  // Generate explanation for recommendation
  private generateReasoning(crop: any, inputFeatures: any, score: number): string {
    const reasons = [];

    // Check NPK compatibility
    const nScore = this.calculateRangeScore(inputFeatures.N, crop.ideal.N);
    const pScore = this.calculateRangeScore(inputFeatures.P, crop.ideal.P);
    const kScore = this.calculateRangeScore(inputFeatures.K, crop.ideal.K);

    if (nScore > 0.8 && pScore > 0.8 && kScore > 0.8) {
      reasons.push('Excellent NPK nutrient match');
    } else if (nScore > 0.6 || pScore > 0.6 || kScore > 0.6) {
      reasons.push('Good nutrient compatibility');
    }

    // Check environmental factors
    const tempScore = this.calculateRangeScore(inputFeatures.temperature, crop.ideal.temperature);
    const humidityScore = this.calculateRangeScore(inputFeatures.humidity, crop.ideal.humidity);
    const rainfallScore = this.calculateRangeScore(inputFeatures.rainfall, crop.ideal.rainfall);

    if (tempScore > 0.8 && humidityScore > 0.8) {
      reasons.push('Ideal climate conditions');
    } else if (tempScore > 0.6) {
      reasons.push('Suitable temperature');
    }

    if (rainfallScore > 0.8) {
      reasons.push('Perfect rainfall conditions');
    } else if (rainfallScore > 0.5) {
      reasons.push('Adequate rainfall');
    }

    // Check season and soil
    if (crop.ideal.seasons.includes(inputFeatures.season)) {
      reasons.push(`Ideal for ${inputFeatures.season} season`);
    }

    if (crop.soilTypes.includes(inputFeatures.soilType)) {
      reasons.push(`Well-suited for ${inputFeatures.soilType} soil`);
    }

    return reasons.length > 0 ? reasons.join('. ') : 'Moderately suitable based on overall conditions';
  }
}

const recommendationService = new CropRecommendationService();

// Generate crop recommendations
export const generateRecommendations = asyncHandler(async (req: AuthRequest, res: Response) => {
  const inputFeatures = req.body;
  const userId = req.user!._id;
  const modelUsed = inputFeatures.modelUsed || 'server';
  const clientIP = req.ip || req.connection.remoteAddress;

  // Generate recommendations
  const recommendations = await recommendationService.generateRecommendations(inputFeatures);

  // Save recommendation log
  const recommendationLog = new RecommendationLog({
    userId,
    inputFeatures,
    recommendations: recommendations.map(rec => ({
      cropId: rec.cropId,
      score: rec.score,
      reasoning: rec.reasoning
    })),
    modelUsed,
    ipAddress: clientIP
  });

  await recommendationLog.save();

  res.json({
    success: true,
    data: {
      recommendations: recommendations.map(rec => ({
        cropId: rec.cropId,
        crop: rec.crop,
        score: rec.score,
        reasoning: rec.reasoning,
        confidence: rec.score > 0.8 ? 'High' : rec.score > 0.6 ? 'Medium' : 'Low'
      })),
      modelUsed,
      generatedAt: new Date()
    }
  });
});

// Get user's recommendation history
export const getRecommendationHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { page = 1, limit = 20 } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [logs, total] = await Promise.all([
    RecommendationLog.find({ userId })
      .populate('recommendations.cropId', 'name scientificName images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-__v')
      .lean(),
    RecommendationLog.countDocuments({ userId })
  ]);

  res.json({
    success: true,
    data: {
      logs,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalLogs: total,
        limit: limitNum,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      }
    }
  });
});

// Submit feedback on recommendations
export const submitFeedback = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { recommendationId, rating, feedback } = req.body;
  const userId = req.user!._id;

  // TODO: Implement feedback storage and analysis
  // This would typically store in a separate feedback collection

  res.json({
    success: true,
    message: 'Feedback submitted successfully'
  });
});

// Get popular/recommended crops
export const getPopularCrops = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Get most commonly recommended crops from logs
  const popularCrops = await RecommendationLog.aggregate([
    { $unwind: '$recommendations' },
    {
      $group: {
        _id: '$recommendations.cropId',
        averageScore: { $avg: '$recommendations.score' },
        recommendationCount: { $sum: 1 }
      }
    },
    { $sort: { recommendationCount: -1, averageScore: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'crops',
        localField: '_id',
        foreignField: '_id',
        as: 'crop'
      }
    },
    { $unwind: '$crop' },
    {
      $project: {
        crop: 1,
        averageScore: 1,
        recommendationCount: 1
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      popularCrops
    }
  });
});

// Compare multiple crops
export const compareCrops = asyncHandler(async (req: AuthRequest, res: Response) => {
  const inputFeatures = req.body;

  // Generate more detailed comparison
  const recommendations = await recommendationService.generateRecommendations(inputFeatures, 3);

  res.json({
    success: true,
    data: {
      comparison: recommendations.map(rec => ({
        cropId: rec.cropId,
        crop: rec.crop,
        score: rec.score,
        reasoning: rec.reasoning,
        strengths: getStrengths(rec.crop, inputFeatures),
        considerations: getConsiderations(rec.crop, inputFeatures)
      }))
    }
  });
});

// Helper functions for comparison
function getStrengths(crop: any, inputFeatures: any): string[] {
  const strengths = [];

  const nScore = recommendationService['calculateRangeScore'](inputFeatures.N, crop.ideal.N);
  if (nScore > 0.8) strengths.push('Excellent nitrogen compatibility');

  const tempScore = recommendationService['calculateRangeScore'](inputFeatures.temperature, crop.ideal.temperature);
  if (tempScore > 0.8) strengths.push('Perfect temperature match');

  if (crop.ideal.seasons.includes(inputFeatures.season)) {
    strengths.push(`Optimal for ${inputFeatures.season} season`);
  }

  if (crop.soilTypes.includes(inputFeatures.soilType)) {
    strengths.push(`Thrives in ${inputFeatures.soilType} soil`);
  }

  return strengths;
}

function getConsiderations(crop: any, inputFeatures: any): string[] {
  const considerations = [];

  const rainfallScore = recommendationService['calculateRangeScore'](inputFeatures.rainfall, crop.ideal.rainfall);
  if (rainfallScore < 0.5) {
    considerations.push('May require additional irrigation');
  }

  const phScore = recommendationService['calculateRangeScore'](inputFeatures.ph, crop.ideal.ph);
  if (phScore < 0.6) {
    considerations.push('Consider soil pH adjustment');
  }

  if (!crop.ideal.seasons.includes(inputFeatures.season)) {
    considerations.push('Not ideal for current season');
  }

  return considerations;
}