import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate wishlist items
wishlistSchema.index({ user: 1, course: 1 }, { unique: true });

// Index for efficient queries
wishlistSchema.index({ user: 1, addedAt: -1 });
wishlistSchema.index({ course: 1 });

// Static method to check if course is in wishlist
wishlistSchema.statics.isInWishlist = async function(userId, courseId) {
  const item = await this.findOne({
    user: userId,
    course: courseId
  });
  return !!item;
};

// Static method to get user's wishlist with course details
wishlistSchema.statics.getUserWishlist = function(userId) {
  return this.find({ user: userId })
    .populate({
      path: 'course',
      select: 'courseTitle shortDescription thumbnail coursePrice discountPrice hasDiscount isFreeCourse instructor rating',
      populate: {
        path: 'instructor',
        select: 'firstName lastName userName avatar'
      }
    })
    .sort({ addedAt: -1 });
};

const Wishlist = mongoose.models.Wishlist || mongoose.model('Wishlist', wishlistSchema);

export default Wishlist;