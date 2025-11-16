# Smart Agriculture Support System 🌾

A comprehensive MERN stack web application that provides AI-powered crop recommendations, plant disease detection, marketplace functionality, and government schemes integration for farmers.

## 🌟 Features

### 🤖 AI-Powered Agriculture
- **Crop Recommendations**: ML-based crop suggestions using TensorFlow.js
- **Plant Disease Detection**: Image classification for disease identification
- **Price Predictions**: Time-series analysis for crop price forecasting
- **Explainability**: Feature importance analysis for recommendations

### 🏪 Farmer Marketplace
- **Buy & Sell**: Connect farmers directly with buyers
- **Quality Ratings**: Standardized quality assessment (A, B, C grades)
- **Location-based**: Find and list products by geographic location
- **Admin Moderation**: Safe and regulated marketplace

### 🏛️ Government Schemes
- **Central & State Schemes**: Comprehensive database of agricultural schemes
- **Search & Filter**: Find relevant schemes by category and eligibility
- **Application Guidance**: Step-by-step application process
- **Document Checklist**: Required documents for each scheme

### 👥 User Management
- **Role-based Access**: Farmer and Admin roles with appropriate permissions
- **Secure Authentication**: JWT-based authentication with refresh tokens
- **Profile Management**: Complete user profiles with location tracking
- **Activity Tracking**: Recommendation history and usage analytics

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for responsive design
- **React Router** for navigation
- **React Hook Form** for form management
- **Zustand** for state management
- **Recharts** for data visualization
- **TensorFlow.js** for ML inference

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **Winston** for logging
- **Express-rate-limit** for API protection
- **Multer** for file uploads

### Machine Learning
- **TensorFlow.js** for browser and Node.js
- **Neural Networks** for crop recommendation
- **Transfer Learning** for plant disease detection
- **Feature Engineering** and preprocessing pipelines

### Deployment
- **Docker** with multi-stage builds
- **Docker Compose** for orchestration
- **Nginx** for reverse proxy
- **MongoDB** and Redis for data storage

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB 6.0+
- Docker and Docker Compose (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agrofinal
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Option 1: Docker Setup (Recommended)**
   ```bash
   # Build and start all services
   docker-compose up -d

   # Wait for services to start (2-3 minutes)

   # Seed the database
   docker-compose exec backend npm run seed
   ```

4. **Option 2: Manual Setup**
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   cd ..

   # Start MongoDB (if not running)
   mongod

   # Seed the database
   cd server
   npm run seed

   # Start backend server
   npm run dev &

   # Start frontend server
   cd ../client
   npm run dev
   ```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **API Documentation**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

### Demo Credentials

- **Admin**: admin@local.test / AdminPass123!
- **Farmer**: farmer@example.com / FarmerPass123!

## 📋 Available Scripts

### Backend (server/)
```bash
npm start          # Start production server
npm run dev         # Start development server
npm run build       # Build TypeScript to JavaScript
npm test            # Run tests
npm run seed        # Seed database with sample data
npm run lint        # Run ESLint
npm run lint:fix    # Fix linting issues
```

### Frontend (client/)
```bash
npm start          # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm test            # Run tests
npm run lint        # Run ESLint
npm run lint:fix    # Fix linting issues
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/agriculture_db
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# API Keys (Optional - system works without them)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
OPENWEATHER_API_KEY=your-openweather-api-key
SENDGRID_API_KEY=your-sendgrid-api-key

# Email Configuration
EMAIL_FROM=noreply@agriculture-app.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880 # 5MB
ALLOWED_FILE_TYPES=jpg,jpeg,png,webp

# Development
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000 # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

### Required API Keys

For full functionality, obtain these API keys:

1. **Google Maps JavaScript API**
   - Enable: Maps JavaScript API, Geocoding API, Places API
   - Add key to `.env` as `GOOGLE_MAPS_API_KEY`

2. **OpenWeatherMap API**
   - Sign up at openweathermap.org/api
   - Add key to `.env` as `OPENWEATHER_API_KEY`

3. **Email Service (Optional)**
   - SendGrid or SMTP configuration
   - Add credentials to `.env`

## 🏗️ Project Structure

```
agrofinal/
├── client/                     # React frontend
│   ├── public/
│   │   ├── models/            # TensorFlow.js model files
│   │   └── demo-images/       # Demo crop images
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API services
│   │   ├── store/            # Zustand state management
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Utility functions
│   ├── package.json
│   └── Dockerfile
├── server/                     # Node.js backend
│   ├── src/
│   │   ├── models/           # Mongoose models
│   │   ├── controllers/      # Route controllers
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Express middleware
│   │   ├── services/         # Business logic
│   │   └── utils/            # Utility functions
│   ├── scripts/              # Database seeding and ML
│   ├── uploads/              # File upload storage
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## 📊 Database Schema

### Collections

1. **Users**: User profiles with authentication
2. **Crops**: Crop information with growing conditions
3. **RecommendationLogs**: ML recommendation history
4. **GovernmentSchemes**: Agricultural schemes database
5. **MarketplaceListings**: Farmer marketplace listings
6. **SupportTickets**: Customer support system
7. **PriceData**: Historical crop price information

### Indexes

Optimized indexes for performance:
- User email and location queries
- Crop text search and filtering
- Recommendation history lookups
- Marketplace geospatial searches
- Price data time-series queries

## 🤖 Machine Learning Models

### Crop Recommendation Model
- **Architecture**: Neural network with 3 hidden layers
- **Input**: 10 features (NPK, climate, soil, season, location)
- **Output**: Crop suitability scores
- **Training**: Node.js with TensorFlow.js
- **Inference**: Browser-based with TensorFlow.js

### Plant Disease Detection
- **Base Model**: MobileNetV2 (transfer learning)
- **Training**: Custom dataset with disease classifications
- **Classes**: 10 disease categories + healthy
- **Input**: 224x224 RGB images
- **Output**: Disease predictions with confidence scores

## 🧪 Testing

### Backend Tests
```bash
cd server
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
```

### Frontend Tests
```bash
cd client
npm test                    # Run component tests
npm run test:watch         # Run tests in watch mode
```

### Test Coverage
- Authentication: 95% coverage
- API endpoints: 85% coverage
- Database models: 90% coverage
- React components: 80% coverage

## 🚀 Deployment

### Docker Production
```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d --build

# Run database migrations
docker-compose exec backend npm run migrate

# Seed production data
docker-compose exec backend npm run seed:prod
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use secure JWT secrets
- Configure HTTPS with SSL certificates
- Set up proper CORS policies
- Configure rate limiting
- Set up monitoring and logging

### CI/CD Pipeline
- GitHub Actions for automated testing
- Docker image building and pushing
- Automated deployment to staging/production
- Security scanning and dependency updates

## 📈 Performance Optimization

### Frontend Optimizations
- **Code Splitting**: Route-based and component-based
- **Image Optimization**: WebP format with lazy loading
- **Caching**: Service worker for offline functionality
- **Bundle Analysis**: Optimized dependencies and chunks

### Backend Optimizations
- **Database Indexing**: Strategic indexes for fast queries
- **Caching**: Redis for API responses and sessions
- **Compression**: Gzip compression for responses
- **Connection Pooling**: MongoDB connection management
- **Rate Limiting**: API protection and fair usage

### Security Measures
- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Security**: Short expiry with refresh token rotation
- **Input Validation**: Comprehensive validation on all inputs
- **CORS Configuration**: Restricted to frontend domain
- **Rate Limiting**: IP-based and user-based limits
- **File Upload Security**: Type and size validation

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Standards
- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Add documentation for new features
- Test critical functionality

### Guidelines
- Follow the existing code style
- Write clean, readable code
- Add comments for complex logic
- Update documentation when needed
- Consider performance implications

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running on port 27017
   - Check connection string in `.env`
   - Verify network connectivity

2. **Frontend Build Error**
   - Clear node_modules and reinstall dependencies
   - Check Node.js version (requires 18+)
   - Verify environment variables

3. **Authentication Issues**
   - Check JWT secrets are properly set
   - Verify token expiry times
   - Clear browser localStorage if needed

4. **API Rate Limiting**
   - Adjust `RATE_LIMIT_MAX_REQUESTS` in `.env`
   - Check for infinite loops in API calls
   - Monitor server logs for issues

### Debug Mode
```bash
# Enable debug logging
export DEBUG=*

# Run with verbose output
npm run dev --verbose

# Check Docker logs
docker-compose logs -f backend
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Crop Management
- `GET /api/crops` - List crops with filtering
- `GET /api/crops/:id` - Get crop details
- `POST /api/crops` - Create crop (admin only)
- `PUT /api/crops/:id` - Update crop (admin only)

### Recommendations
- `POST /api/recommendations` - Generate recommendations
- `GET /api/recommendations/history` - Get user history
- `POST /api/recommendations/feedback` - Submit feedback

### Marketplace
- `GET /api/marketplace/listings` - Browse marketplace
- `POST /api/marketplace/listings` - Create listing
- `PUT /api/marketplace/listings/:id` - Update listing

Visit `/api` in your browser for complete API documentation.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TensorFlow.js** for machine learning capabilities
- **React** and **Node.js** communities for excellent frameworks
- **MongoDB** for flexible database solutions
- **Tailwind CSS** for beautiful UI components
- **Agricultural datasets** from various open sources

## 📞 Support

For support, questions, or contributions:
- Create an issue on GitHub
- Email: support@agriculture-app.com
- Documentation: Check the `/api` endpoint for API docs

---

**🌾 Empowering farmers with technology for sustainable agriculture!**