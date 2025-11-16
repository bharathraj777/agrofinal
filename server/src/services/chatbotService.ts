import { ChatBotSession, IChatBotSession } from '../models';
import { Crop, GovernmentScheme } from '../models';
import { AppError } from '../middleware';

interface Intent {
  name: string;
  keywords: string[];
  response: string;
  entities?: string[];
  followUp?: string[];
}

interface ChatResponse {
  message: string;
  intent: string;
  confidence: number;
  entities?: { type: string; value: string }[];
  suggestions?: string[];
  actions?: {
    type: string;
    data: any;
  }[];
}

class ChatBotService {
  private intents: Intent[];

  constructor() {
    this.initializeIntents();
  }

  private initializeIntents() {
    this.intents = [
      {
        name: 'greeting',
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'namaste'],
        response: 'Hello! I\'m your agricultural assistant. How can I help you today with farming, crops, or government schemes?',
        followUp: [
          'What would you like to know about?',
          'Are you looking for crop recommendations or farming advice?',
          'Do you need information about government schemes?'
        ]
      },
      {
        name: 'crop_recommendation',
        keywords: ['recommend', 'suggest', 'crop', 'plant', 'grow', 'cultivate', 'best crop'],
        response: 'I can help you find the best crops for your farm. To give you personalized recommendations, I\'ll need some information about your soil and conditions.',
        entities: ['soil_type', 'location', 'season', 'farm_size'],
        followUp: [
          'What type of soil do you have (clayey, loamy, sandy, etc.)?',
          'What is your farm location?',
          'Which season are you planning for?',
          'How big is your farm?'
        ]
      },
      {
        name: 'plant_disease',
        keywords: ['disease', 'sick', 'pest', 'infection', 'fungus', 'bacteria', 'wilting', 'yellow leaves'],
        response: 'Plant diseases can be concerning! I can help identify common issues and suggest treatments. You can also upload a photo of your plant for better diagnosis.',
        followUp: [
          'What type of plant is affected?',
          'What symptoms do you observe (yellowing, spots, wilting)?',
          'Would you like to upload a photo for better diagnosis?',
          'How long have you noticed these symptoms?'
        ]
      },
      {
        name: 'government_scheme',
        keywords: ['scheme', 'government', 'subsidy', 'loan', 'benefit', 'support', 'financial help'],
        response: 'There are many government schemes available to support farmers. Let me help you find relevant ones based on your needs.',
        entities: ['crop_type', 'location', 'farm_size'],
        followUp: [
          'Are you looking for subsidies, loans, or insurance?',
          'What type of farming do you do?',
          'Which state are you located in?'
        ]
      },
      {
        name: 'weather',
        keywords: ['weather', 'rain', 'temperature', 'climate', 'monsoon', 'season'],
        response: 'Weather conditions are crucial for farming. Current weather patterns can help determine the best crops and planting times.',
        followUp: [
          'Would you like weather information for your location?',
          'Are you planning for the upcoming season?',
          'Do you need irrigation advice based on current weather?'
        ]
      },
      {
        name: 'market_price',
        keywords: ['price', 'market', 'sell', 'rate', 'cost', 'income', 'profit'],
        response: 'Understanding market prices is essential for profitable farming. I can help you with current price information and market trends.',
        entities: ['crop_type', 'location', 'quantity'],
        followUp: [
          'Which crop are you interested in selling?',
          'What\'s your location for market information?',
          'Do you need help with market timing?'
        ]
      },
      {
        name: 'fertilizer',
        keywords: ['fertilizer', 'nutrient', 'NPK', 'manure', 'compost', 'soil health'],
        response: 'Proper fertilization is key to healthy crops. The right fertilizer depends on your soil type and the crops you\'re growing.',
        followUp: [
          'What crops are you growing?',
          'Have you done a soil test recently?',
          'What type of fertilizer do you currently use?'
        ]
      },
      {
        name: 'irrigation',
        keywords: ['water', 'irrigation', 'drought', 'flood', 'watering', 'sprinkler', 'drip'],
        response: 'Water management is crucial for successful farming. Different crops and soils have different water requirements.',
        followUp: [
          'What\'s your water source (borewell, canal, rain)?',
          'What type of irrigation do you use?',
          'Are you facing water scarcity issues?'
        ]
      },
      {
        name: 'marketplace',
        keywords: ['buy', 'sell', 'marketplace', 'listing', 'customer', 'buyer', 'seller'],
        response: 'Our marketplace connects farmers directly with buyers. You can list your produce or find buyers for your crops.',
        followUp: [
          'Would you like to list your crops for sale?',
          'Are you looking to buy agricultural products?',
          'What type of produce are you interested in?'
        ]
      },
      {
        name: 'help',
        keywords: ['help', 'how to', 'tutorial', 'guide', 'instructions', 'assist'],
        response: 'I\'m here to help! I can assist you with crop recommendations, disease identification, government schemes, market prices, and general farming advice.',
        followUp: [
          'What specific topic would you like help with?',
          'Are you a new farmer or experienced?',
          'Do you need immediate assistance with a problem?'
        ]
      },
      {
        name: 'farewell',
        keywords: ['bye', 'goodbye', 'thank you', 'thanks', 'see you', 'exit', 'quit'],
        response: 'You\'re welcome! Feel free to come back anytime for agricultural assistance. Happy farming! 🌾',
      }
    ];
  }

  async processMessage(userId: string, sessionId: string, message: string, userContext?: any): Promise<ChatResponse> {
    try {
      // Get or create chat session
      let session = await ChatBotSession.findOne({ userId, sessionId, isActive: true });

      if (!session) {
        session = new ChatBotSession({
          userId,
          sessionId,
          messages: [],
          userContext: userContext || {},
          isActive: true
        });
      }

      // Add user message to session
      session.messages.push({
        sender: 'user',
        message: message.toLowerCase().trim(),
        timestamp: new Date()
      });

      // Process the message
      const response = await this.generateResponse(message, session.userContext);

      // Add bot response to session
      session.messages.push({
        sender: 'bot',
        message: response.message,
        timestamp: new Date(),
        intent: response.intent,
        confidence: response.confidence,
        entities: response.entities
      });

      // Update session
      session.lastActivity = new Date();
      await session.save();

      return response;
    } catch (error) {
      console.error('Chatbot error:', error);
      throw new AppError('Failed to process message', 500);
    }
  }

  private async generateResponse(message: string, userContext: any): Promise<ChatResponse> {
    const normalizedMessage = message.toLowerCase().trim();

    // Find matching intent
    let bestMatch = this.findBestIntent(normalizedMessage);

    // Extract entities from the message
    const entities = this.extractEntities(normalizedMessage, bestMatch);

    // Update user context with extracted entities
    this.updateUserContext(userContext, entities);

    // Generate contextual response
    let response = this.generateContextualResponse(bestMatch, userContext, entities);

    return response;
  }

  private findBestIntent(message: string): Intent {
    let bestMatch = this.intents[0]; // Default to greeting
    let bestScore = 0;

    for (const intent of this.intents) {
      let score = 0;

      for (const keyword of intent.keywords) {
        if (message.includes(keyword)) {
          score += 1;
          // Exact match gets higher score
          if (message === keyword) {
            score += 2;
          }
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = intent;
      }
    }

    return {
      ...bestMatch,
      confidence: Math.min(bestScore / 3, 1) // Normalize confidence
    };
  }

  private extractEntities(message: string, intent: Intent): { type: string; value: string }[] {
    const entities: { type: string; value: string }[] = [];

    // Extract soil types
    const soilTypes = ['clayey', 'loamy', 'sandy', 'peaty', 'chalky', 'silty'];
    for (const soilType of soilTypes) {
      if (message.includes(soilType)) {
        entities.push({ type: 'soil_type', value: soilType });
      }
    }

    // Extract locations (Indian states)
    const states = ['andhra pradesh', 'arunachal pradesh', 'assam', 'bihar', 'chhattisgarh', 'goa', 'gujarat', 'haryana', 'himachal pradesh', 'jharkhand', 'karnataka', 'kerala', 'madhya pradesh', 'maharashtra', 'manipur', 'meghalaya', 'mizoram', 'nagaland', 'odisha', 'punjab', 'rajasthan', 'sikkim', 'tamil nadu', 'telangana', 'tripura', 'uttar pradesh', 'uttarakhand', 'west bengal'];
    for (const state of states) {
      if (message.includes(state)) {
        entities.push({ type: 'location', value: state });
      }
    }

    // Extract seasons
    const seasons = ['kharif', 'rabi', 'zaid', 'summer', 'winter', 'monsoon'];
    for (const season of seasons) {
      if (message.includes(season)) {
        entities.push({ type: 'season', value: season });
      }
    }

    // Extract crop names
    const cropNames = ['rice', 'wheat', 'maize', 'cotton', 'sugarcane', 'pulses', 'millets', 'barley', 'gram', 'tur', 'moong', 'urad', 'soybean', 'groundnut'];
    for (const crop of cropNames) {
      if (message.includes(crop)) {
        entities.push({ type: 'crop_type', value: crop });
      }
    }

    // Extract numbers (for quantities, areas, etc.)
    const numbers = message.match(/\d+(\.\d+)?/g);
    if (numbers) {
      for (const num of numbers) {
        if (parseFloat(num) <= 1000) { // Reasonable range for farm size
          entities.push({ type: 'quantity', value: num });
        }
      }
    }

    return entities;
  }

  private updateUserContext(userContext: any, entities: { type: string; value: string }[]) {
    for (const entity of entities) {
      switch (entity.type) {
        case 'soil_type':
          userContext.soilType = entity.value;
          break;
        case 'location':
          userContext.location = { address: entity.value };
          break;
        case 'season':
          userContext.lastTopics = userContext.lastTopics || [];
          if (!userContext.lastTopics.includes('season')) {
            userContext.lastTopics.push('season');
          }
          break;
        case 'crop_type':
          userContext.cropPreferences = userContext.cropPreferences || [];
          if (!userContext.cropPreferences.includes(entity.value)) {
            userContext.cropPreferences.push(entity.value);
          }
          break;
        case 'quantity':
          userContext.farmSize = parseFloat(entity.value);
          break;
      }
    }
  }

  private async generateContextualResponse(intent: Intent, userContext: any, entities: { type: string; value: string }[]): Promise<ChatResponse> {
    let message = intent.response;
    let suggestions: string[] = intent.followUp || [];
    let actions: any[] = [];

    // Add contextual information based on user data
    if (intent.name === 'crop_recommendation' && userContext.soilType && userContext.cropPreferences) {
      const crops = await Crop.find({
        soilTypes: userContext.soilType,
        isActive: true
      }).limit(3);

      if (crops.length > 0) {
        message += ` Based on your ${userContext.soilType} soil, I recommend considering ${crops.map(c => c.name).join(', ')}.`;
        actions.push({
          type: 'crop_recommendation',
          data: { soilType: userContext.soilType, crops: crops }
        });
      }
    }

    if (intent.name === 'government_scheme' && userContext.location) {
      const schemes = await GovernmentScheme.find({
        state: { $in: [userContext.location.address, 'All India'] },
        isActive: true
      }).limit(3);

      if (schemes.length > 0) {
        message += ` There are ${schemes.length} schemes available in your area, including "${schemes[0].title}".`;
        actions.push({
          type: 'schemes',
          data: { schemes: schemes }
        });
      }
    }

    if (intent.name === 'market_price' && userContext.cropPreferences && userContext.cropPreferences.length > 0) {
      message += ` For ${userContext.cropPreferences[0]}, current market rates are competitive. Would you like specific price information?`;
      actions.push({
        type: 'price_info',
        data: { crop: userContext.cropPreferences[0] }
      });
    }

    // Add personalized suggestions
    if (userContext.lastTopics && userContext.lastTopics.length > 0) {
      const lastTopic = userContext.lastTopics[userContext.lastTopics.length - 1];
      if (lastTopic !== intent.name) {
        suggestions.unshift(`You were previously asking about ${lastTopic}. Would you like to continue with that?`);
      }
    }

    return {
      message,
      intent: intent.name,
      confidence: intent.confidence,
      entities,
      suggestions,
      actions
    };
  }

  async getChatSession(userId: string, sessionId: string): Promise<IChatBotSession | null> {
    return await ChatBotSession.findOne({ userId, sessionId, isActive: true })
      .populate('userId', 'name email')
      .sort({ 'messages.timestamp': 1 });
  }

  async updateSessionFeedback(sessionId: string, satisfaction: number): Promise<void> {
    await ChatBotSession.updateOne(
      { sessionId },
      { satisfaction, lastActivity: new Date() }
    );
  }

  async endSession(userId: string, sessionId: string): Promise<void> {
    await ChatBotSession.updateOne(
      { userId, sessionId },
      { isActive: false, lastActivity: new Date() }
    );
  }
}

export default new ChatBotService();