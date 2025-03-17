import mongoose from 'mongoose';

/**
 * User Schema
 * Defines the structure and behavior of user documents in the database
 */
const userSchema = new mongoose.Schema({
  // Basic user information
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
    default: '/default-avatar.png',
  },
  phoneNumber: {
    type: String,
    default: null,
  },

  // Location information for proximity-based features
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
      default: [0, 0],
    },
  },

  // User preferences for item discovery
  preferences: {
    radius: {
      type: Number,
      default: 10, // Default radius in kilometers
    },
    categories: [{
      type: String,
      enum: ['tops', 'bottoms', 'dresses', 'shoes', 'accessories'],
    }],
  },

  // User progression system
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 50,
  },
  experience: {
    type: Number,
    default: 0,
    min: 0,
  },
  completedTrades: {
    type: Number,
    default: 0,
    min: 0,
  },
  positiveReviews: {
    type: Number,
    default: 0,
    min: 0,
  },

  // Timestamps for tracking user activity
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a 2dsphere index for efficient location-based queries
userSchema.index({ location: '2dsphere' });

/**
 * Pre-save middleware to update the updatedAt timestamp
 */
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

/**
 * Calculates the experience required for the next level
 * Uses exponential scaling to make higher levels harder to achieve
 * @returns {number} Required experience points for next level
 */
userSchema.methods.getRequiredExperience = function() {
  // Base experience is 100, increases by 50% per level
  return Math.floor(100 * Math.pow(1.5, this.level - 1));
};

/**
 * Adds experience points and handles level up logic
 * @param {number} amount - Experience points to add
 */
userSchema.methods.addExperience = async function(amount: number) {
  this.experience += amount;
  
  // Check for level up
  while (this.experience >= this.getRequiredExperience()) {
    this.experience -= this.getRequiredExperience();
    this.level = Math.min(50, this.level + 1);
  }
  
  await this.save();
};

/**
 * Determines the color of the user's level indicator
 * Colors change every 5 levels, with 10 different colors total
 * @returns {string} Hex color code for the level indicator
 */
userSchema.methods.getLevelColor = function() {
  const colors = [
    '#808080', // Grey (1-4)
    '#00ff00', // Green (5-9)
    '#0000ff', // Blue (10-14)
    '#800080', // Purple (15-19)
    '#ff00ff', // Magenta (20-24)
    '#ff0000', // Red (25-29)
    '#ffa500', // Orange (30-34)
    '#ffff00', // Yellow (35-39)
    '#00ffff', // Cyan (40-44)
    '#ffd700', // Gold (45-50)
  ];
  
  const colorIndex = Math.min(9, Math.floor((this.level - 1) / 5));
  return colors[colorIndex];
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User; 