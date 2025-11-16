import { Router } from 'express';
import * as plantDiseaseController from '../controllers/plantDiseaseController';
import { authenticateToken, requireAdmin } from '../middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Disease detection
router.post('/detect',
  plantDiseaseController.uploadImage,
  plantDiseaseController.detectDisease
);

// Model management
router.get('/models', plantDiseaseController.getAvailableModels);

// Admin-only routes
router.post('/train', requireAdmin, plantDiseaseController.trainModel);
router.post('/evaluate', requireAdmin, plantDiseaseController.evaluateModel);

// Disease information
router.get('/disease/:disease', plantDiseaseController.getDiseaseInfo);

export default router;