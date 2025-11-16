import { Request, Response } from 'express';
import { Crop, ICrop } from '../models';
import { AuthRequest, AppError, asyncHandler } from '../middleware';
import mongoose from 'mongoose';

// List all crops with pagination and filtering
export const listCrops = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 20,
    search,
    soilType,
    season,
    waterRequirement
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Build filter object
  const filter: any = { isActive: true };

  if (search) {
    filter.$text = { $search: search as string };
  }

  if (soilType) {
    filter.soilTypes = soilType;
  }

  if (season) {
    filter['ideal.seasons'] = season;
  }

  if (waterRequirement) {
    filter.waterRequirement = waterRequirement;
  }

  // Execute query with pagination
  const [crops, total] = await Promise.all([
    Crop.find(filter)
      .select('-__v')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Crop.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: {
      crops,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalCrops: total,
        limit: limitNum,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      }
    }
  });
});

// Get crop by ID
export const getCropById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid crop ID', 400);
  }

  const crop = await Crop.findOne({ _id: id, isActive: true });

  if (!crop) {
    throw new AppError('Crop not found', 404);
  }

  res.json({
    success: true,
    data: {
      crop
    }
  });
});

// Create new crop (admin only)
export const createCrop = asyncHandler(async (req: AuthRequest, res: Response) => {
  const cropData = req.body;

  // Check if crop with same name already exists
  const existingCrop = await Crop.findOne({ name: cropData.name });
  if (existingCrop) {
    throw new AppError('Crop with this name already exists', 400);
  }

  const crop = new Crop(cropData);
  await crop.save();

  res.status(201).json({
    success: true,
    message: 'Crop created successfully',
    data: {
      crop
    }
  });
});

// Update crop (admin only)
export const updateCrop = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid crop ID', 400);
  }

  // Check if another crop with the same name exists (if name is being updated)
  if (updates.name) {
    const existingCrop = await Crop.findOne({
      name: updates.name,
      _id: { $ne: id }
    });
    if (existingCrop) {
      throw new AppError('Crop with this name already exists', 400);
    }
  }

  const crop = await Crop.findByIdAndUpdate(
    id,
    { ...updates, updatedAt: new Date() },
    { new: true, runValidators: true }
  );

  if (!crop) {
    throw new AppError('Crop not found', 404);
  }

  res.json({
    success: true,
    message: 'Crop updated successfully',
    data: {
      crop
    }
  });
});

// Delete crop (soft delete, admin only)
export const deleteCrop = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid crop ID', 400);
  }

  const crop = await Crop.findByIdAndUpdate(
    id,
    { isActive: false, updatedAt: new Date() },
    { new: true }
  );

  if (!crop) {
    throw new AppError('Crop not found', 404);
  }

  res.json({
    success: true,
    message: 'Crop deleted successfully'
  });
});

// Search crops
export const searchCrops = asyncHandler(async (req: Request, res: Response) => {
  const { query } = req.params;

  if (!query || query.trim().length === 0) {
    throw new AppError('Search query is required', 400);
  }

  const crops = await Crop.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { scientificName: { $regex: query, $options: 'i' } }
        ]
      }
    ]
  })
  .select('name scientificName images')
  .limit(10)
  .lean();

  res.json({
    success: true,
    data: {
      crops,
      query
    }
  });
});

// Get crop filters (for UI dropdowns, etc.)
export const getCropFilters = asyncHandler(async (req: Request, res: Response) => {
  const [soilTypes, seasons, waterRequirements] = await Promise.all([
    Crop.distinct('soilTypes', { isActive: true }),
    Crop.distinct('ideal.seasons', { isActive: true }),
    Crop.distinct('waterRequirement', { isActive: true })
  ]);

  res.json({
    success: true,
    data: {
      soilTypes,
      seasons,
      waterRequirements
    }
  });
});