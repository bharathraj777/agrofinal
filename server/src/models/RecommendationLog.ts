import mongoose, { Document, Schema } from 'mongoose';

export interface IRecommendationLog extends Document {
  userId: mongoose.Types.ObjectId;
  inputFeatures: {
    N: number;
    P: number;
    K: number;
    temperature: number;
    humidity: number;
    rainfall: number;
    ph: number;
    soilType: string;
    season: string;
    location?: {
      lat: number;
      lng: number;
    };
  };
  recommendations: {
    cropId: mongoose.Types.ObjectId;
    score: number;
    reasoning?: string;
  }[];
  modelUsed: 'client' | 'server';
  ipAddress?: string;
}

const recommendationLogSchema = new Schema<IRecommendationLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  inputFeatures: {
    N: {
      type: Number,
      required: true,
      min: 0
    },
    P: {
      type: Number,
      required: true,
      min: 0
    },
    K: {
      type: Number,
      required: true,
      min: 0
    },
    temperature: {
      type: Number,
      required: true,
      min: -50,
      max: 60
    },
    humidity: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    rainfall: {
      type: Number,
      required: true,
      min: 0
    },
    ph: {
      type: Number,
      required: true,
      min: 0,
      max: 14
    },
    soilType: {
      type: String,
      enum: ['clayey', 'loamy', 'sandy', 'peaty', 'chalky', 'silty'],
      required: true
    },
    season: {
      type: String,
      enum: ['kharif', 'rabi', 'zaid', 'summer', 'winter', 'monsoon'],
      required: true
    },
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
      }
    }
  },
  recommendations: [{
    cropId: {
      type: Schema.Types.ObjectId,
      ref: 'Crop',
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    reasoning: {
      type: String,
      trim: true
    }
  }],
  modelUsed: {
    type: String,
    enum: ['client', 'server'],
    required: true
  },
  ipAddress: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for performance
recommendationLogSchema.index({ userId: 1, createdAt: -1 });
recommendationLogSchema.index({ createdAt: -1 });
recommendationLogSchema.index({ modelUsed: 1 });

export default mongoose.model<IRecommendationLog>('RecommendationLog', recommendationLogSchema);