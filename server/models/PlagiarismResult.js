import mongoose from 'mongoose';

const plagiarismResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  originalFileName: {
    type: String,
    required: true,
    trim: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['pdf', 'doc', 'docx', 'txt']
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  plagiarismScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  originalityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  wordCount: {
    type: Number,
    default: 0
  },
  sources: [{
    url: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    similarity: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    matchedWords: {
      type: Number,
      default: 0
    },
    description: {
      type: String,
      trim: true
    }
  }],
  suggestions: [{
    type: String,
    trim: true
  }],
  textContent: {
    type: String,
    select: false // Don't include in regular queries for performance
  },
  highlightedText: {
    type: String,
    select: false // Don't include in regular queries for performance
  },
  processingTime: {
    type: Number, // in milliseconds
    default: 0
  },
  errorMessage: {
    type: String,
    trim: true
  },
  reportGenerated: {
    type: Boolean,
    default: false
  },
  reportPath: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
plagiarismResultSchema.index({ userId: 1, createdAt: -1 });
plagiarismResultSchema.index({ status: 1 });
plagiarismResultSchema.index({ plagiarismScore: 1 });

// Virtual for originality percentage
plagiarismResultSchema.virtual('originalityPercentage').get(function() {
  return 100 - this.plagiarismScore;
});

// Method to get risk level based on plagiarism score
plagiarismResultSchema.methods.getRiskLevel = function() {
  if (this.plagiarismScore <= 10) return 'low';
  if (this.plagiarismScore <= 25) return 'medium';
  return 'high';
};

// Method to get color coding for UI
plagiarismResultSchema.methods.getScoreColor = function() {
  if (this.plagiarismScore <= 10) return 'green';
  if (this.plagiarismScore <= 25) return 'yellow';
  return 'red';
};

export default mongoose.model('PlagiarismResult', plagiarismResultSchema);