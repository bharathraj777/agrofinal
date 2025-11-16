import { Request, Response } from 'express';
import chatbotService from '../services/chatbotService';
import { AuthRequest, AppError, asyncHandler } from '../middleware';

// Send message to chatbot
export const sendMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { message, sessionId } = req.body;
  const userId = req.user!._id;

  if (!message || message.trim().length === 0) {
    throw new AppError('Message is required', 400);
  }

  if (!sessionId) {
    throw new AppError('Session ID is required', 400);
  }

  const response = await chatbotService.processMessage(userId, sessionId, message);

  res.json({
    success: true,
    data: response
  });
});

// Get chat session history
export const getChatSession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;
  const userId = req.user!._id;

  const session = await chatbotService.getChatSession(userId, sessionId);

  if (!session) {
    throw new AppError('Chat session not found', 404);
  }

  res.json({
    success: true,
    data: session
  });
});

// Update session feedback
export const updateFeedback = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;
  const { satisfaction } = req.body;

  if (!satisfaction || satisfaction < 1 || satisfaction > 5) {
    throw new AppError('Satisfaction rating must be between 1 and 5', 400);
  }

  await chatbotService.updateSessionFeedback(sessionId, satisfaction);

  res.json({
    success: true,
    message: 'Thank you for your feedback!'
  });
});

// End chat session
export const endSession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;
  const userId = req.user!._id;

  await chatbotService.endSession(userId, sessionId);

  res.json({
    success: true,
    message: 'Chat session ended'
  });
});

// Get all chat sessions for user
export const getChatHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { page = 1, limit = 10 } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const ChatBotSession = require('../models/ChatBotSession').default;

  const [sessions, total] = await Promise.all([
    ChatBotSession.find({ userId, isActive: false })
      .select('sessionId messages.createdAt messages.sender lastActivity satisfaction')
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    ChatBotSession.countDocuments({ userId, isActive: false })
  ]);

  res.json({
    success: true,
    data: {
      sessions,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalSessions: total,
        limit: limitNum,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      }
    }
  });
});

// Start new chat session
export const startSession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { context } = req.body;

  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Process initial greeting
  const response = await chatbotService.processMessage(
    userId,
    sessionId,
    'hello',
    context
  );

  res.json({
    success: true,
    data: {
      sessionId,
      initialResponse: response
    }
  });
});