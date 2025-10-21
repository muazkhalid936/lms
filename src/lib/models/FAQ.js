import mongoose from "mongoose";

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  answer: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  order: {
    type: Number,
    required: true,
    min: 1
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
faqSchema.index({ course: 1, order: 1 });
faqSchema.index({ course: 1, isPublished: 1 });

// Pre-save middleware to ensure unique order within course
faqSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('order')) {
    const existingFaq = await this.constructor.findOne({
      course: this.course,
      order: this.order,
      _id: { $ne: this._id }
    });
    
    if (existingFaq) {
      const error = new Error('FAQ order must be unique within the course');
      error.name = 'ValidationError';
      return next(error);
    }
  }
  next();
});

// Static method to find FAQs by course
faqSchema.statics.findByCourse = function(courseId) {
  return this.find({ course: courseId }).sort({ order: 1 });
};

// Static method to find published FAQs by course
faqSchema.statics.findPublishedByCourse = function(courseId) {
  return this.find({ course: courseId, isPublished: true }).sort({ order: 1 });
};

const FAQ = mongoose.models.FAQ || mongoose.model('FAQ', faqSchema);

export default FAQ;