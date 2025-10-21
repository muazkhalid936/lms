import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
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
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true
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
  type: {
    type: String,
    required: true,
    enum: ['video', 'youtube', 'document', 'text', 'liveClass'],
    trim: true
  },
  
  // Content based on type
  content: {
    // For video type
    videoUrl: String,
    videoKey: String, // AWS S3 key for deletion
    
    // For youtube type
    youtubeUrl: String,
    youtubeId: String,
    
    // For document type
    documentUrl: String,
    documentKey: String, // AWS S3 key for deletion
    documentName: String,
    documentSize: Number, // in bytes
    documentType: String, // mime type
    
    // For text type
    textContent: String,
    
    // For live class type
    liveClassData: {
      scheduledDate: String,
      scheduledTime: String,
      maxParticipants: Number,
      requiresRegistration: Boolean,
      sendReminders: Boolean,
      recordSession: Boolean,
    },
    
    // Common fields
    thumbnailUrl: String,
    thumbnailKey: String
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
  },
  
  isPublished: {
    type: Boolean,
    default: false
  },
  isFree: {
    type: Boolean,
    default: false
  },
  
  // Lesson completion tracking
  completions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    watchTime: {
      type: Number, // in seconds
      default: 0
    }
  }],
  
  // Lesson notes/attachments
  attachments: [{
    name: String,
    url: String,
    key: String, // AWS S3 key
    size: Number,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Lesson settings
  settings: {
    allowDownload: {
      type: Boolean,
      default: false
    },
    autoPlay: {
      type: Boolean,
      default: false
    },
    showTranscript: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
lessonSchema.index({ chapter: 1, order: 1 });
lessonSchema.index({ course: 1, isPublished: 1 });
lessonSchema.index({ course: 1, chapter: 1, order: 1 });
lessonSchema.index({ 'completions.student': 1 });

// Pre-save middleware to ensure unique order within chapter
lessonSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('order')) {
    const existingLesson = await this.constructor.findOne({
      chapter: this.chapter,
      order: this.order,
      _id: { $ne: this._id }
    });
    
    if (existingLesson) {
      const error = new Error('Lesson order must be unique within the chapter');
      error.name = 'ValidationError';
      return next(error);
    }
  }
  next();
});

// Method to get total duration in minutes
lessonSchema.methods.getTotalMinutes = function() {
  return (this.duration.hours * 60) + this.duration.minutes + (this.duration.seconds / 60);
};

// Method to format duration display
lessonSchema.methods.getFormattedDuration = function() {
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

// Method to check if lesson is completed by student
lessonSchema.methods.isCompletedBy = function(studentId) {
  return this.completions.some(completion => 
    completion.student.toString() === studentId.toString()
  );
};

// Method to get completion data for student
lessonSchema.methods.getCompletionData = function(studentId) {
  return this.completions.find(completion => 
    completion.student.toString() === studentId.toString()
  );
};

// Method to mark as completed by student
lessonSchema.methods.markCompleted = function(studentId, watchTime = 0) {
  const existingCompletion = this.completions.find(completion =>
    completion.student.toString() === studentId.toString()
  );
  
  if (!existingCompletion) {
    this.completions.push({
      student: studentId,
      completedAt: new Date(),
      watchTime: watchTime
    });
  } else {
    existingCompletion.completedAt = new Date();
    existingCompletion.watchTime = Math.max(existingCompletion.watchTime, watchTime);
  }
  
  return this.save();
};

// Method to extract YouTube video ID from URL
lessonSchema.methods.extractYouTubeId = function(url) {
  if (!url) return null;
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[2].length === 11) ? match[2] : null;
};

// Pre-save middleware to extract YouTube ID
lessonSchema.pre('save', function(next) {
  if (this.type === 'youtube' && this.content.youtubeUrl) {
    this.content.youtubeId = this.extractYouTubeId(this.content.youtubeUrl);
  }
  next();
});

// Static method to find lessons by chapter
lessonSchema.statics.findByChapter = function(chapterId) {
  return this.find({ chapter: chapterId }).sort({ order: 1 });
};

// Static method to find published lessons by chapter
lessonSchema.statics.findPublishedByChapter = function(chapterId) {
  return this.find({ chapter: chapterId, isPublished: true }).sort({ order: 1 });
};

// Static method to find lessons by course
lessonSchema.statics.findByCourse = function(courseId) {
  return this.find({ course: courseId }).sort({ order: 1 });
};

const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);

export default Lesson;