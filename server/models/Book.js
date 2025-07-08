import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  author: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  isbn: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Computer Science', 'Finance Management', 'Engineering', 'General'],
    index: true
  },
  totalCopies: {
    type: Number,
    required: true,
    min: 1
  },
  availableCopies: {
    type: Number,
    required: true,
    min: 0
  },
  publishedYear: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear()
  },
  description: {
    type: String,
    trim: true
  },
  publisher: {
    type: String,
    trim: true
  },
  language: {
    type: String,
    default: 'English'
  },
  pages: {
    type: Number,
    min: 1
  },
  location: {
    shelf: String,
    section: String,
    floor: String
  },
  tags: [{
    type: String,
    trim: true
  }],
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  popularity: {
    borrowCount: { type: Number, default: 0 },
    reservationCount: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'retired'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Text search index
bookSchema.index({
  title: 'text',
  author: 'text',
  description: 'text',
  tags: 'text'
});

export default mongoose.model('Book', bookSchema);