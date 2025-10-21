import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  isHelpful: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
reviewSchema.index({ course: 1, student: 1 }, { unique: true }); // One review per student per course
reviewSchema.index({ course: 1, createdAt: -1 }); // For fetching course reviews
reviewSchema.index({ student: 1, createdAt: -1 }); // For fetching student reviews

// Pre-save middleware to update timestamps
reviewSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to calculate course rating
reviewSchema.statics.calculateCourseRating = async function(courseId) {
  const stats = await this.aggregate([
    {
      $match: { 
        course: new mongoose.Types.ObjectId(courseId),
        isApproved: true
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      average: 0,
      count: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  const result = stats[0];
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  result.ratingDistribution.forEach(rating => {
    distribution[rating] = (distribution[rating] || 0) + 1;
  });

  return {
    average: Math.round(result.averageRating * 10) / 10, // Round to 1 decimal
    count: result.totalReviews,
    distribution
  };
};

// Instance method to check if helpful
reviewSchema.methods.markHelpful = function() {
  this.isHelpful += 1;
  return this.save();
};

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

export default Review;