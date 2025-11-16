import mongoose, { Document, Schema } from 'mongoose';

export interface IPriceData extends Document {
  cropId: mongoose.Types.ObjectId;
  location: {
    state: string;
    district?: string;
    market?: string;
  };
  price: number;
  date: Date;
  source: string;
  quality?: string;
  marketType: 'retail' | 'wholesale' | 'mandi';
}

const priceDataSchema = new Schema<IPriceData>({
  cropId: {
    type: Schema.Types.ObjectId,
    ref: 'Crop',
    required: [true, 'Crop ID is required']
  },
  location: {
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    district: {
      type: String,
      trim: true
    },
    market: {
      type: String,
      trim: true
    }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [1, 'Price must be at least 1 INR']
  },
  date: {
    type: Date,
    required: [true, 'Price date is required'],
    validate: {
      validator: function(v: Date) {
        return v <= new Date();
      },
      message: 'Price date cannot be in the future'
    }
  },
  source: {
    type: String,
    required: [true, 'Data source is required'],
    trim: true,
    default: 'static'
  },
  quality: {
    type: String,
    trim: true
  },
  marketType: {
    type: String,
    enum: ['retail', 'wholesale', 'mandi'],
    required: [true, 'Market type is required'],
    default: 'wholesale'
  }
}, {
  timestamps: true
});

// Indexes for performance
priceDataSchema.index({ cropId: 1, location: 1, date: -1 });
priceDataSchema.index({ date: -1 });
priceDataSchema.index({ "location.state": 1, date: -1 });
priceDataSchema.index({ source: 1, date: -1 });

export default mongoose.model<IPriceData>('PriceData', priceDataSchema);