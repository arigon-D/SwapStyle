import mongoose from 'mongoose';

const tradeItemSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clothing',
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const tradeSchema = new mongoose.Schema({
  initiator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  initiatorItems: [tradeItemSchema],
  receiverItems: [tradeItemSchema],
  initiatorAccepted: {
    type: Boolean,
    default: false,
  },
  receiverAccepted: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'cancelled'],
    default: 'pending',
  },
  meetingDetails: {
    time: Date,
    location: {
      type: String,
      default: null,
    },
    coordinates: {
      type: [Number],
      default: null,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
tradeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Trade = mongoose.models.Trade || mongoose.model('Trade', tradeSchema);

export default Trade; 