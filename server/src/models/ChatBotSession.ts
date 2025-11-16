import mongoose, { Document, Schema } from 'mongoose';

export interface IChatBotSession extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId: string;
  messages: {
    sender: 'user' | 'bot';
    message: string;
    timestamp: Date;
    intent?: string;
    confidence?: number;
    entities?: {
      type: string;
      value: string;
    }[];
  }[];
  userContext: {
    location?: {
      lat: number;
      lng: number;
      address?: string;
    };
    cropPreferences?: string[];
    soilType?: string;
    farmSize?: number;
    experience?: 'beginner' | 'intermediate' | 'expert';
    lastTopics?: string[];
  };
  isActive: boolean;
  lastActivity: Date;
  satisfaction?: number; // 1-5 rating
}

const chatBotSessionSchema = new Schema<IChatBotSession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
    default: () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  messages: [{
    sender: {
      type: String,
      enum: ['user', 'bot'],
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    intent: {
      type: String,
      trim: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    entities: [{
      type: {
        type: String,
        required: true
      },
      value: {
        type: String,
        required: true
      }
    }]
  }],
  userContext: {
    location: {
      lat: {
        type: Number,
        min: -90,
        max: 90
      },
      lng: {
        type: Number,
        min: -180,
        max: 180
      },
      address: {
        type: String,
        trim: true
      }
    },
    cropPreferences: [{
      type: String,
      trim: true
    }],
    soilType: {
      type: String,
      enum: ['clayey', 'loamy', 'sandy', 'peaty', 'chalky', 'silty']
    },
    farmSize: {
      type: Number,
      min: 0,
      max: 10000 // hectares
    },
    experience: {
      type: String,
      enum: ['beginner', 'intermediate', 'expert']
    },
    lastTopics: [{
      type: String,
      trim: true
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  satisfaction: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

// Indexes for performance
chatBotSessionSchema.index({ userId: 1, lastActivity: -1 });
chatBotSessionSchema.index({ sessionId: 1 });
chatBotSessionSchema.index({ isActive: 1, lastActivity: -1 });
chatBotSessionSchema.index({ 'messages.timestamp': -1 });

export default mongoose.model<IChatBotSession>('ChatBotSession', chatBotSessionSchema);