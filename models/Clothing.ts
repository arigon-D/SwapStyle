import mongoose from 'mongoose';

const clothingSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['tops', 'bottoms', 'dresses', 'shoes', 'accessories'],
  },
  size: {
    type: String,
    required: true,
  },
  condition: {
    type: String,
    required: true,
    enum: ['new', 'like_new', 'good', 'fair', 'poor'],
  },
  images: [{
    type: String,
    required: true,
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  status: {
    type: String,
    enum: ['available', 'pending', 'swapped'],
    default: 'available',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a 2dsphere index for location-based queries
clothingSchema.index({ location: '2dsphere' });

// Create a text index for search functionality
clothingSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Update the updatedAt timestamp before saving
clothingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Clothing = mongoose.models.Clothing || mongoose.model('Clothing', clothingSchema);

export default Clothing; 