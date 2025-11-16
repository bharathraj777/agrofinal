import mongoose, { Document, Schema } from 'mongoose';

export interface ICrop extends Document {
  name: string;
  scientificName: string;
  images: string[];
  ideal: {
    N: [number, number];
    P: [number, number];
    K: [number, number];
    temperature: [number, number];
    humidity: [number, number];
    rainfall: [number, number];
    ph: [number, number];
    seasons: string[];
  };
  soilTypes: string[];
  pesticides: string[];
  fertilizers: {
    name: string;
    dosage: string;
    applicationTime: string;
  }[];
  priceSource: string;
  typicalYield: number;
  growingPeriod: number;
  waterRequirement: 'Low' | 'Medium' | 'High';
  isActive: boolean;
}

const cropSchema = new Schema<ICrop>({
  name: {
    type: String,
    required: [true, 'Crop name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Crop name cannot exceed 100 characters']
  },
  scientificName: {
    type: String,
    required: [true, 'Scientific name is required'],
    trim: true,
    maxlength: [200, 'Scientific name cannot exceed 200 characters']
  },
  images: [{
    type: String,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(v);
      },
      message: 'Please enter valid image URLs (jpg, jpeg, png, webp)'
    }
  }],
  ideal: {
    N: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v: [number, number]) {
          return v.length === 2 && v[0] >= 0 && v[1] >= 0 && v[1] >= v[0];
        },
        message: 'Nitrogen range must be [min, max] with non-negative values'
      }
    },
    P: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v: [number, number]) {
          return v.length === 2 && v[0] >= 0 && v[1] >= 0 && v[1] >= v[0];
        },
        message: 'Phosphorus range must be [min, max] with non-negative values'
      }
    },
    K: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v: [number, number]) {
          return v.length === 2 && v[0] >= 0 && v[1] >= 0 && v[1] >= v[0];
        },
        message: 'Potassium range must be [min, max] with non-negative values'
      }
    },
    temperature: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v: [number, number]) {
          return v.length === 2 && v[0] >= -50 && v[1] <= 60 && v[1] >= v[0];
        },
        message: 'Temperature range must be [min, max] between -50°C and 60°C'
      }
    },
    humidity: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v: [number, number]) {
          return v.length === 2 && v[0] >= 0 && v[1] <= 100 && v[1] >= v[0];
        },
        message: 'Humidity range must be [min, max] between 0% and 100%'
      }
    },
    rainfall: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v: [number, number]) {
          return v.length === 2 && v[0] >= 0 && v[1] >= 0 && v[1] >= v[0];
        },
        message: 'Rainfall range must be [min, max] with non-negative values'
      }
    },
    ph: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v: [number, number]) {
          return v.length === 2 && v[0] >= 0 && v[1] <= 14 && v[1] >= v[0];
        },
        message: 'pH range must be [min, max] between 0 and 14'
      }
    },
    seasons: [{
      type: String,
      enum: ['kharif', 'rabi', 'zaid', 'summer', 'winter', 'monsoon'],
      required: true
    }]
  },
  soilTypes: [{
    type: String,
    enum: ['clayey', 'loamy', 'sandy', 'peaty', 'chalky', 'silty'],
    required: true
  }],
  pesticides: [{
    type: String,
    trim: true
  }],
  fertilizers: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    dosage: {
      type: String,
      required: true,
      trim: true
    },
    applicationTime: {
      type: String,
      required: true,
      trim: true
    }
  }],
  priceSource: {
    type: String,
    required: true,
    trim: true,
    default: 'static'
  },
  typicalYield: {
    type: Number,
    required: true,
    min: [0, 'Typical yield must be non-negative']
  },
  growingPeriod: {
    type: Number,
    required: true,
    min: [1, 'Growing period must be at least 1 day']
  },
  waterRequirement: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true,
    default: 'Medium'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
cropSchema.index({ name: "text", scientificName: "text" });
cropSchema.index({ "ideal.seasons": 1 });
cropSchema.index({ isActive: 1 });
cropSchema.index({ soilTypes: 1 });

export default mongoose.model<ICrop>('Crop', cropSchema);