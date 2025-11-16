import { Router } from 'express';
import { body } from 'express-validator';
import * as chatbotController from '../controllers/chatbotController';
import { authenticateToken, validateRequest } from '../middleware';

const router = Router();

// Validation schemas
const messageValidation = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('sessionId')
    .notEmpty()
    .withMessage('Session ID is required')
    .isLength({ min: 10, max: 100 })
    .withMessage('Session ID must be between 10 and 100 characters')
];

const feedbackValidation = [
  body('satisfaction')
    .isInt({ min: 1, max: 5 })
    .withMessage('Satisfaction rating must be between 1 and 5')
];

// All chatbot routes require authentication
router.post('/start',
  authenticateToken,
  chatbotController.startSession
);

router.post('/message',
  authenticateToken,
  messageValidation,
  validateRequest,
  chatbotController.sendMessage
);

router.get('/session/:sessionId',
  authenticateToken,
  chatbotController.getChatSession
);

router.patch('/session/:sessionId/feedback',
  authenticateToken,
  feedbackValidation,
  validateRequest,
  chatbotController.updateFeedback
);

router.delete('/session/:sessionId',
  authenticateToken,
  chatbotController.endSession
);

router.get('/history',
  authenticateToken,
  chatbotController.getChatHistory
);

export default router;