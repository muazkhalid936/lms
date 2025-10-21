import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
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
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completedLessons: [{
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  completedAt: {
    type: Date,
    default: null
  },
  paymentDetails: {
    transactionId: String,
    amount: Number,
    paymentMethod: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'completed'
    },
    paidAt: Date
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate enrollments per course
enrollmentSchema.index({ student: 1, course: 1 }, { 
  unique: true,
  name: 'student_course_unique' // Explicit name for the compound index
});

// Index for efficient queries
enrollmentSchema.index({ student: 1, status: 1 }, { name: 'student_status' });
enrollmentSchema.index({ course: 1, status: 1 }, { name: 'course_status' });

// Pre-init hook to ensure correct indexes
enrollmentSchema.pre('init', function() {
  // This will be called when the model is first compiled
});

// Static method to ensure indexes are correct
enrollmentSchema.statics.ensureIndexes = async function() {
  try {
    // Drop any conflicting single-field student index if it exists
    await this.collection.dropIndex('student_1').catch(() => {
      // Index might not exist, ignore error
    });
    
    // Ensure our compound index exists
    await this.collection.createIndex(
      { student: 1, course: 1 }, 
      { unique: true, name: 'student_course_unique' }
    );
    
    //console.log('Enrollment indexes ensured correctly');
  } catch (error) {
    //console.log('Index management:', error.message);
  }
};

// Method to calculate progress
enrollmentSchema.methods.calculateProgress = async function() {
  const mongoose = require('mongoose');
  const Lesson = mongoose.models.Lesson;
  
  if (!Lesson) {
    return 0;
  }
  
  try {
    // Get total lessons for the course
    const totalLessons = await Lesson.countDocuments({ course: this.course });
    
    if (totalLessons === 0) {
      return 0;
    }
    
    // Calculate progress percentage
    const progress = Math.round((this.completedLessons.length / totalLessons) * 100);
    this.progress = progress;
    
    // Mark as completed if 100% progress
    if (progress === 100 && this.status === 'active') {
      this.status = 'completed';
      this.completedAt = new Date();
    }
    
    return progress;
  } catch (error) {
    console.error('Error calculating progress:', error);
    return this.progress;
  }
};

// Method to mark lesson as completed
enrollmentSchema.methods.completeLesson = function(lessonId) {
  const existingLesson = this.completedLessons.find(
    lesson => lesson.lesson.toString() === lessonId.toString()
  );
  
  if (!existingLesson) {
    this.completedLessons.push({
      lesson: lessonId,
      completedAt: new Date()
    });
  }
};

// Static method to check if student is enrolled
enrollmentSchema.statics.isEnrolled = async function(studentId, courseId) {
  const enrollment = await this.findOne({
    student: studentId,
    course: courseId,
    status: { $in: ['active', 'completed'] }
  });
  return !!enrollment;
};

const Enrollment = mongoose.models.Enrollment || mongoose.model('Enrollment', enrollmentSchema);

// Ensure correct indexes when model is loaded
if (!mongoose.models.Enrollment) {
  // Only run this when the model is first created, not on subsequent imports
  Enrollment.ensureIndexes().catch(console.error);
}

export default Enrollment;