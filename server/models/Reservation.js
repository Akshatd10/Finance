import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reservationDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'fulfilled', 'expired', 'cancelled'],
    default: 'active'
  },
  priority: {
    type: Number,
    default: 1
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound indexes
reservationSchema.index({ bookId: 1, status: 1, priority: 1 });
reservationSchema.index({ memberId: 1, status: 1 });
reservationSchema.index({ expiryDate: 1, status: 1 });

export default mongoose.model('Reservation', reservationSchema);