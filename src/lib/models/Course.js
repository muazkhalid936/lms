import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    // Course Information
    courseTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    courseCategory: {
      type: String,
      required: true,
      trim: true,
    },
    courseLevel: {
      type: String,
      required: true,
      enum: ["beginner", "intermediate", "advanced"],
      trim: true,
    },
    language: {
      type: String,
      required: true,
      trim: true,
    },
    maxStudents: {
      type: Number,
      min: 1,
      max: 10000,
    },
    courseType: {
      type: String,
      required: true,
      enum: ["private", "public", "premium", "Paid", "Free"],
      trim: true,
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    courseDescription: {
      type: String,
      required: true,
      trim: true,
    },
    learningOutcomes: [
      {
        type: String,
        trim: true,
      },
    ],
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // Course Media
    thumbnail: {
      url: String,
      key: String, // AWS S3 key for deletion
      uploadedAt: Date,
    },

    // Pricing
    isFreeCourse: {
      type: Boolean,
      default: true,
    },
    coursePrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    hasDiscount: {
      type: Boolean,
      default: false,
    },
    discountPrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    expiryPeriod: {
      type: String,
      enum: ["limited", "lifetime", "unlimited"],
      default: "lifetime",
    },
    numberOfMonths: {
      type: Number,
      min: 1,
      max: 60,
    },

    // Additional Info
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    instructorMessage: {
      type: String,
      trim: true,
    },

    // Course Status
    status: {
      type: String,
      enum: ["draft", "under_review", "published", "rejected"],
      default: "published",
    },

    // Instructor Reference
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Course Statistics
    enrolledStudents: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    totalStudents: {
      type: Number,
      default: 0,
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },

    // Course Statistics (calculated from chapters/lessons)
    totalLessons: {
      type: Number,
      default: 0,
    },
    totalQuizzes: {
      type: Number,
      default: 0,
    },
    totalDuration: {
      hours: {
        type: Number,
        default: 0,
      },
      minutes: {
        type: Number,
        default: 0,
      },
      seconds: {
        type: Number,
        default: 0,
      },
    },

    // Publication dates
    publishedAt: Date,
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for chapters
courseSchema.virtual("chapters", {
  ref: "Chapter",
  localField: "_id",
  foreignField: "course",
});

// Virtual for FAQs
courseSchema.virtual("faqs", {
  ref: "FAQ",
  localField: "_id",
  foreignField: "course",
});

// Virtual for reviews
courseSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "course",
});

// Virtual for live classes
courseSchema.virtual("liveClasses", {
  ref: "LiveClass",
  localField: "_id",
  foreignField: "course",
});

// Index for search functionality
// Set language_override to a non-conflicting field name so MongoDB
// doesn't interpret the `language` field on documents as a text index
// language override. This prevents errors when storing values like
// 'hindi' or 'urdu' which are not supported language names for the
// text index language override.
courseSchema.index(
  { courseTitle: "text", shortDescription: "text", tags: "text" },
  { language_override: "language_override", default_language: "none" }
);

// Index for filtering
courseSchema.index({ courseCategory: 1, courseLevel: 1, status: 1 });
courseSchema.index({ instructor: 1, status: 1 });

// Pre-save middleware to update lastUpdated and publishedAt
courseSchema.pre("save", function (next) {
  this.lastUpdated = new Date();

  // Set publishedAt when course is first published
  if (this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

// Method to calculate discount percentage
courseSchema.methods.getDiscountPercentage = function () {
  if (!this.hasDiscount || !this.coursePrice || this.coursePrice === 0) {
    return 0;
  }
  return Math.round(
    ((this.coursePrice - this.discountPrice) / this.coursePrice) * 100
  );
};

// Method to get final price
courseSchema.methods.getFinalPrice = function () {
  if (this.isFreeCourse) return 0;
  if (this.hasDiscount && this.discountPrice < this.coursePrice) {
    return this.discountPrice;
  }
  return this.coursePrice;
};

// Method to calculate total lessons, quizzes and duration
courseSchema.methods.calculateCourseStats = async function () {
  const mongoose = require("mongoose");

  try {
    // Get all lessons for this course directly using mongoose
    const Lesson = mongoose.models.Lesson;
    const Quiz = mongoose.models.Quiz;

    if (!Lesson) {
      throw new Error("Lesson model not found");
    }
    if (!Quiz) {
      throw new Error("Quiz model not found");
    }

    const lessons = await Lesson.find({ course: this._id });
    const quizzes = await Quiz.find({ course: this._id });

    // Calculate total lessons and quizzes
    this.totalLessons = lessons.length;
    this.totalQuizzes = quizzes.length;

    // Calculate total duration
    let totalSeconds = 0;
    lessons.forEach((lesson) => {
      const lessonSeconds =
        lesson.duration.hours * 3600 +
        lesson.duration.minutes * 60 +
        (lesson.duration.seconds || 0);
      totalSeconds += lessonSeconds;
    });

    // Convert total seconds to hours, minutes, seconds
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    this.totalDuration = {
      hours: hours,
      minutes: minutes,
      seconds: seconds,
    };

    return {
      totalLessons: this.totalLessons,
      totalQuizzes: this.totalQuizzes,
      totalDuration: this.totalDuration,
    };
  } catch (error) {
    console.error("Error calculating course stats:", error);
    return null;
  }
};

// Method to format total duration for display
courseSchema.methods.getFormattedTotalDuration = function () {
  const h = this.totalDuration.hours;
  const m = this.totalDuration.minutes;
  const s = this.totalDuration.seconds;

  if (h > 0) {
    return `${h}h ${m}m`;
  } else if (m > 0) {
    return `${m}m ${s}s`;
  } else {
    return `${s}s`;
  }
};

// Method to get course overview stats
courseSchema.methods.getCourseOverview = async function () {
  const stats = await this.calculateCourseStats();

  // Get upcoming live classes count
  const upcomingLiveClasses = await mongoose.model("LiveClass").countDocuments({
    course: this._id,
    status: "scheduled",
    scheduledAt: { $gte: new Date() },
  });

  return {
    totalLessons: this.totalLessons,
    totalQuizzes: this.totalQuizzes,
    totalDuration: this.getFormattedTotalDuration(),
    totalStudents: this.totalStudents,
    rating: this.rating,
    upcomingLiveClasses,
  };
};

// Static method to find published courses
courseSchema.statics.findPublished = function () {
  return this.find({ status: "published" });
};

// Static method to find courses by instructor
courseSchema.statics.findByInstructor = function (instructorId) {
  return this.find({ instructor: instructorId });
};

const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);

export default Course;
