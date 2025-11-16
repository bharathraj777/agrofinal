import { Router } from 'express';
import { body, query } from 'express-validator';
import * as cropController from '../controllers/cropController';
import { authenticateToken, requireAdmin, validateRequest, validateQuery } from '../middleware';

const router = Router();

// Validation schemas
const createCropValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Crop name must be between 2 and 100 characters'),
  body('scientificName')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Scientific name must be between 2 and 200 characters'),
  body('images')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 images allowed'),
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),
  body('ideal.N')
    .isArray({ min: 2, max: 2 })
    .withMessage('Nitrogen must be an array with [min, max] values'),
  body('ideal.N.*')
    .isFloat({ min: 0 })
    .withMessage('Nitrogen values must be non-negative'),
  body('ideal.P')
    .isArray({ min: 2, max: 2 })
    .withMessage('Phosphorus must be an array with [min, max] values'),
  body('ideal.P.*')
    .isFloat({ min: 0 })
    .withMessage('Phosphorus values must be non-negative'),
  body('ideal.K')
    .isArray({ min: 2, max: 2 })
    .withMessage('Potassium must be an array with [min, max] values'),
  body('ideal.K.*')
    .isFloat({ min: 0 })
    .withMessage('Potassium values must be non-negative'),
  body('ideal.temperature')
    .isArray({ min: 2, max: 2 })
    .withMessage('Temperature must be an array with [min, max] values'),
  body('ideal.temperature.*')
    .isFloat({ min: -50, max: 60 })
    .withMessage('Temperature values must be between -50°C and 60°C'),
  body('ideal.humidity')
    .isArray({ min: 2, max: 2 })
    .withMessage('Humidity must be an array with [min, max] values'),
  body('ideal.humidity.*')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Humidity values must be between 0% and 100%'),
  body('ideal.rainfall')
    .isArray({ min: 2, max: 2 })
    .withMessage('Rainfall must be an array with [min, max] values'),
  body('ideal.rainfall.*')
    .isFloat({ min: 0 })
    .withMessage('Rainfall values must be non-negative'),
  body('ideal.ph')
    .isArray({ min: 2, max: 2 })
    .withMessage('pH must be an array with [min, max] values'),
  body('ideal.ph.*')
    .isFloat({ min: 0, max: 14 })
    .withMessage('pH values must be between 0 and 14'),
  body('ideal.seasons')
    .isArray({ min: 1 })
    .withMessage('At least one season must be specified'),
  body('ideal.seasons.*')
    .isIn(['kharif', 'rabi', 'zaid', 'summer', 'winter', 'monsoon'])
    .withMessage('Invalid season value'),
  body('soilTypes')
    .isArray({ min: 1 })
    .withMessage('At least one soil type must be specified'),
  body('soilTypes.*')
    .isIn(['clayey', 'loamy', 'sandy', 'peaty', 'chalky', 'silty'])
    .withMessage('Invalid soil type value'),
  body('pesticides')
    .optional()
    .isArray()
    .withMessage('Pesticides must be an array'),
  body('fertilizers')
    .optional()
    .isArray()
    .withMessage('Fertilizers must be an array'),
  body('fertilizers.*.name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Fertilizer name is required'),
  body('fertilizers.*.dosage')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Fertilizer dosage is required'),
  body('fertilizers.*.applicationTime')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Fertilizer application time is required'),
  body('priceSource')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Price source cannot be empty'),
  body('typicalYield')
    .isFloat({ min: 0 })
    .withMessage('Typical yield must be non-negative'),
  body('growingPeriod')
    .isInt({ min: 1 })
    .withMessage('Growing period must be at least 1 day'),
  body('waterRequirement')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Invalid water requirement value')
];

const listCropsQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search term cannot be empty'),
  query('soilType')
    .optional()
    .isIn(['clayey', 'loamy', 'sandy', 'peaty', 'chalky', 'silty'])
    .withMessage('Invalid soil type'),
  query('season')
    .optional()
    .isIn(['kharif', 'rabi', 'zaid', 'summer', 'winter', 'monsoon'])
    .withMessage('Invalid season'),
  query('waterRequirement')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Invalid water requirement')
];

// Routes
// Public routes
router.get('/', listCropsQueryValidation, validateQuery, cropController.listCrops);
router.get('/search/:query', cropController.searchCrops);
router.get('/filters', cropController.getCropFilters);
router.get('/:id', cropController.getCropById);

// Protected routes (admin only)
router.post('/', authenticateToken, requireAdmin, createCropValidation, validateRequest, cropController.createCrop);
router.put('/:id', authenticateToken, requireAdmin, createCropValidation, validateRequest, cropController.updateCrop);
router.delete('/:id', authenticateToken, requireAdmin, cropController.deleteCrop);

export default router;