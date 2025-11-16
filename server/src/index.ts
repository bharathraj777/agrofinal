import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

// Import middleware
import { errorHandler, notFound, generalLimiter } from './middleware';

// Import routes
import authRoutes from './routes/auth';
import cropRoutes from './routes/crops';
import recommendationRoutes from './routes/recommendations';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply general rate limiting
app.use(generalLimiter);

// Static file serving (for uploads, etc.)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/recommendations', recommendationRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Smart Agriculture Support System API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'User login',
        'POST /api/auth/refresh': 'Refresh access token',
        'POST /api/auth/logout': 'User logout',
        'GET /api/auth/me': 'Get current user',
        'POST /api/auth/forgot-password': 'Request password reset',
        'POST /api/auth/reset-password': 'Reset password'
      },
      crops: {
        'GET /api/crops': 'List all crops with filtering',
        'GET /api/crops/:id': 'Get crop details',
        'POST /api/crops': 'Create new crop (admin only)',
        'PUT /api/crops/:id': 'Update crop (admin only)',
        'DELETE /api/crops/:id': 'Delete crop (admin only)',
        'GET /api/crops/search/:query': 'Search crops',
        'GET /api/crops/filters': 'Get crop filter options'
      },
      recommendations: {
        'POST /api/recommendations': 'Generate crop recommendations',
        'GET /api/recommendations/history': 'Get recommendation history',
        'POST /api/recommendations/feedback': 'Submit feedback',
        'GET /api/recommendations/popular': 'Get popular crops',
        'POST /api/recommendations/compare': 'Compare crops'
      }
    }
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Database connection and server startup
const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/agriculture_db';

    await mongoose.connect(mongoUri, {
      // Connection options removed for newer Mongoose versions
    });

    console.log('✅ Connected to MongoDB');

    // Start server after successful database connection
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📍 API URL: http://localhost:${PORT}/api`);
      console.log(`❤️  Health check: http://localhost:${PORT}/health`);
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('Please ensure MongoDB is running and accessible');
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server...');

  try {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');

  try {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
connectDatabase();

export default app;