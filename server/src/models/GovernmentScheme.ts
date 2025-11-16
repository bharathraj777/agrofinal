import mongoose, { Document, Schema } from 'mongoose';

export interface IGovernmentScheme extends Document {
  title: string;
  description: string;
  state: string;
  category: 'subsidy' | 'loan' | 'insurance' | 'equipment' | 'training' | 'other';
  eligibility: string[];
  benefits: string;
  documents: string[];
  applicationSteps: string[];
  applyUrl?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
    office?: string;
  };
  deadline?: Date;
  isActive: boolean;
  tags: string[];
}

const governmentSchemeSchema = new Schema<IGovernmentScheme>({
  title: {
    type: String,
    required: [true, 'Scheme title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Scheme description is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    default: 'All India'
  },
  category: {
    type: String,
    enum: ['subsidy', 'loan', 'insurance', 'equipment', 'training', 'other'],
    required: [true, 'Scheme category is required']
  },
  eligibility: [{
    type: String,
    required: true,
    trim: true
  }],
  benefits: {
    type: String,
    required: [true, 'Benefits description is required'],
    trim: true
  },
  documents: [{
    type: String,
    required: true,
    trim: true
  }],
  applicationSteps: [{
    type: String,
    required: true,
    trim: true
  }],
  applyUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Please enter a valid URL'
    }
  },
  contactInfo: {
    phone: {
      type: String,
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    email: {
      type: String,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    website: {
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Please enter a valid website URL'
      }
    },
    office: {
      type: String,
      trim: true
    }
  },
  deadline: {
    type: Date,
    validate: {
      validator: function(v: Date) {
        return !v || v > new Date();
      },
      message: 'Deadline must be in the future'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for performance
governmentSchemeSchema.index({ state: 1, isActive: 1 });
governmentSchemeSchema.index({ category: 1, isActive: 1 });
governmentSchemeSchema.index({ tags: 1 });
governmentSchemeSchema.index({ title: "text", description: "text" });

export default mongoose.model<IGovernmentScheme>('GovernmentScheme', governmentSchemeSchema);