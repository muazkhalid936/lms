import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  selectedOptionIndex: {
    type: Number,
    required: true,
    min: 0
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  _id: false
});

const quizResultSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
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
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true
  },
  answers: [answerSchema],
  score: {
    type: Number,
    required: true,
    min: 0
  },
  totalMarks: {
    type: Number,
    required: true,
    min: 0
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  passingMarks: {
    type: Number,
    required: true,
    min: 0
  },
  isPassed: {
    type: Boolean,
    required: true
  },
  timeSpent: {
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
  startedAt: {
    type: Date,
    required: true
  },
  submittedAt: {
    type: Date,
    required: true
  },
  attemptNumber: {
    type: Number,
    required: true,
    min: 1
  }
}, {
  timestamps: true
});

// Calculate percentage and pass status before saving
quizResultSchema.pre('save', function(next) {
  if (this.totalMarks > 0) {
    this.percentage = Math.round((this.score / this.totalMarks) * 100);
    this.isPassed = this.percentage >= this.passingMarks;
  } else {
    this.percentage = 0;
    this.isPassed = false;
  }
  next();
});

// Compound index for efficient queries
quizResultSchema.index({ quiz: 1, student: 1, attemptNumber: 1 });
quizResultSchema.index({ student: 1, course: 1 });
quizResultSchema.index({ quiz: 1, isPassed: 1 });

const QuizResult = mongoose.models.QuizResult || mongoose.model('QuizResult', quizResultSchema);

export default QuizResult;