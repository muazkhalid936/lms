import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
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
    default: false
  },
  isFree: {
    type: Boolean,
    default: false
  },
  duration: {
    hours: {
      type: Number,
      default: 0,
      min: 0
    },
    minutes: {
      type: Number,
      default: 0,
      min: 0,
      max: 59
    },
    seconds: {
      type: Number,
      default: 0,
      min: 0,
      max: 59
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for lessons
chapterSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'chapter',
  options: { sort: { order: 1 } }
});

// Virtual for quizzes
chapterSchema.virtual('quizzes', {
  ref: 'Quiz',
  localField: '_id',
  foreignField: 'chapter',
  options: { sort: { order: 1 } }
});

// Virtual for lesson count
chapterSchema.virtual('lessonCount', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'chapter',
  count: true
});

// Virtual for quiz count
chapterSchema.virtual('quizCount', {
  ref: 'Quiz',
  localField: '_id',
  foreignField: 'chapter',
  count: true
});

// Index for efficient querying
chapterSchema.index({ course: 1, order: 1 });
chapterSchema.index({ course: 1, isPublished: 1 });

// Pre-save middleware to ensure unique order within course
chapterSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('order')) {
    const existingChapter = await this.constructor.findOne({
      course: this.course,
      order: this.order,
      _id: { $ne: this._id }
    });
    
    if (existingChapter) {
      const error = new Error('Chapter order must be unique within the course');
      error.name = 'ValidationError';
      return next(error);
    }
  }
  next();
});

// Method to get total duration in minutes
chapterSchema.methods.getTotalMinutes = function() {
  return (this.duration.hours * 60) + this.duration.minutes + (this.duration.seconds / 60);
};

// Method to format duration display
chapterSchema.methods.getFormattedDuration = function() {
  const h = this.duration.hours;
  const m = this.duration.minutes;
  const s = this.duration.seconds;
  
  if (h > 0) {
    return `${h}h ${m}m ${s}s`;
  } else if (m > 0) {
    return `${m}m ${s}s`;
  } else {
    return `${s}s`;
  }
};

// Static method to find chapters by course
chapterSchema.statics.findByCourse = function(courseId) {
  return this.find({ course: courseId }).sort({ order: 1 });
};

// Static method to find published chapters by course
chapterSchema.statics.findPublishedByCourse = function(courseId) {
  return this.find({ course: courseId, isPublished: true }).sort({ order: 1 });
};

const Chapter = mongoose.models.Chapter || mongoose.model('Chapter', chapterSchema);

export default Chapter;