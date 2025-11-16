import { Router } from 'express';
import { body, query } from 'express-validator';
import * as recommendationController from '../controllers/recommendationController';
import { authenticateToken, validateRequest, validateQuery, recommendationLimiter } from '../middleware';

const router = Router();

// Validation schemas
const recommendationValidation = [
  body('N')
    .isFloat({ min: 0, max: 500 })
    .withMessage('Nitrogen must be between 0 and 500 kg/ha'),
  body('P')
    .isFloat({ min: 0, max: 500 })
    .withMessage('Phosphorus must be between 0 and 500 kg/ha'),
  body('K')
    .isFloat({ min: 0, max: 500 })
    .withMessage('Potassium must be between 0 and 500 kg/ha'),
  body('temperature')
    .isFloat({ min: -50, max: 60 })
    .withMessage('Temperature must be between -50°C and 60°C'),
  body('humidity')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Humidity must be between 0% and 100%'),
  body('rainfall')
    .isFloat({ min: 0, max: 5000 })
    .withMessage('Rainfall must be between 0 and 5000 mm'),
  body('ph')
    .isFloat({ min: 0, max: 14 })
    .withMessage('pH must be between 0 and 14'),
  body('soilType')
    .isIn(['clayey', 'loamy', 'sandy', 'peaty', 'chalky', 'silty'])
    .withMessage('Invalid soil type'),
  body('season')
    .isIn(['kharif', 'rabi', 'zaid', 'summer', 'winter', 'monsoon'])
    .withMessage('Invalid season'),
  body('location.lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('location.lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('modelUsed')
    .optional()
    .isIn(['client', 'server'])
    .withMessage('Invalid model type')
];

const feedbackValidation = [
  body('recommendationId')
    .notEmpty()
    .withMessage('Recommendation ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('feedback')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Feedback cannot exceed 1000 characters')
];

const historyQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

// Routes
// All recommendation routes require authentication
router.post('/',
  authenticateToken,
  recommendationLimiter,
  recommendationValidation,
  validateRequest,
  recommendationController.generateRecommendations
);

router.get('/history',
  authenticateToken,
  historyQueryValidation,
  validateQuery,
  recommendationController.getRecommendationHistory
);

router.post('/feedback',
  authenticateToken,
  feedbackValidation,
  validateRequest,
  recommendationController.submitFeedback
);

router.get('/popular',
  authenticateToken,
  recommendationController.getPopularCrops
);

router.post('/compare',
  authenticateToken,
  recommendationValidation,
  validateRequest,
  recommendationController.compareCrops
);

export default router;