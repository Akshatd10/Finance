import mongoose from 'mongoose';

const bookDonationSchema = new mongoose.Schema({
  donorId: {
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
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    required: true
  },
  publishedYear: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear()
  },
  description: {
    type: String,
    trim: true
  },
  estimatedValue: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processed'],
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

export default mongoose.model('BookDonation', bookDonationSchema);