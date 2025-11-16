import mongoose, { Document, Schema } from 'mongoose';

export interface IMarketplaceListing extends Document {
  sellerId: mongoose.Types.ObjectId;
  cropId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  quantity: number;
  pricePerQuintal: number;
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    state: string;
  };
  images: string[];
  availableFrom: Date;
  availableUntil?: Date;
  harvestDate: Date;
  quality: 'A' | 'B' | 'C';
  certification?: string[];
  status: 'pending' | 'approved' | 'rejected' | 'sold' | 'expired';
  rejectionReason?: string;
  viewCount: number;
  expiresAt: Date;
}

const marketplaceListingSchema = new Schema<IMarketplaceListing>({
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller ID is required']
  },
  cropId: {
    type: Schema.Types.ObjectId,
    ref: 'Crop',
    required: [true, 'Crop ID is required']
  },
  title: {
    type: String,
    required: [true, 'Listing title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0.1, 'Quantity must be at least 0.1 quintal']
  },
  pricePerQuintal: {
    type: Number,
    required: [true, 'Price per quintal is required'],
    min: [1, 'Price must be at least 1 INR']
  },
  location: {
    lat: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    }
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
  availableFrom: {
    type: Date,
    required: [true, 'Available from date is required'],
    default: Date.now
  },
  availableUntil: {
    type: Date,
    validate: {
      validator: function(v: Date) {
        return !v || v > this.availableFrom;
      },
      message: 'Available until date must be after available from date'
    }
  },
  harvestDate: {
    type: Date,
    required: [true, 'Harvest date is required'],
    validate: {
      validator: function(v: Date) {
        return v <= new Date();
      },
      message: 'Harvest date cannot be in the future'
    }
  },
  quality: {
    type: String,
    enum: ['A', 'B', 'C'],
    required: [true, 'Quality grade is required']
  },
  certification: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'sold', 'expired'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
marketplaceListingSchema.index({ cropId: 1, status: 1 });
marketplaceListingSchema.index({ "location.state": 1, status: 1 });
marketplaceListingSchema.index({ sellerId: 1, createdAt: -1 });
marketplaceListingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
marketplaceListingSchema.index({ status: 1, createdAt: -1 });
marketplaceListingSchema.index({ pricePerQuintal: 1 });

export default mongoose.model<IMarketplaceListing>('MarketplaceListing', marketplaceListingSchema);