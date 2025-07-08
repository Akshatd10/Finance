import mongoose from 'mongoose';

const bookRequestSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  isbn: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Computer Science', 'Finance Management', 'Engineering', 'General']
  },
  publishedYear: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear()
  },
  publisher: {
    type: String,
    trim: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  estimatedCost: {
    type: Number,
    min: 0
  },
  supportingUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    supportDate: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'ordered', 'received'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewDate: {
    type: Date
  },
  reviewNotes: {
    type: String,
    trim: true
  },
  orderDate: {
    type: Date
  },
  expectedDelivery: {
    type: Date
  },
  receivedDate: {
    type: Date
  },
  addedToInventory: {
    type: Boolean,
    default: false
  },
  inventoryBookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  }
}, {
  timestamps: true
});

export default mongoose.model('BookRequest', bookRequestSchema);