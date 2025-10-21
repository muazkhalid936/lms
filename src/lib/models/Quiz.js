import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  options: [{
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    isCorrect: {
      type: Boolean,
      default: false
    }
  }],
  points: {
    type: Number,
    default: 1,
    min: 1
  }
}, {
  _id: true
});

const quizSchema = new mongoose.Schema({
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
  questions: [questionSchema],
  passingMarks: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  totalMarks: {
    type: Number,
    default: 0
  },
  timeLimit: {
    hours: {
      type: Number,
      default: 0,
      min: 0
    },
    minutes: {
      type: Number,
      default: 30,
      min: 1,
      max: 59
    },
    seconds: {
      type: Number,
      default: 0,
      min: 0,
      max: 59
    }
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  allowRetake: {
    type: Boolean,
    default: true
  },
  maxAttempts: {
    type: Number,
    default: 3,
    min: 1
  },
  shuffleQuestions: {
    type: Boolean,
    default: false
  },
  shuffleOptions: {
    type: Boolean,
    default: false
  },
  showResults: {
    type: Boolean,
    default: true
  },
  showCorrectAnswers: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isFree: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Calculate total marks when questions are saved
quizSchema.pre('save', function(next) {
  if (this.questions && this.questions.length > 0) {
    this.totalMarks = this.questions.reduce((total, question) => total + question.points, 0);
  }
  next();
});

// Validate that each question has exactly one correct answer
questionSchema.pre('validate', function(next) {
  const correctAnswers = this.options.filter(option => option.isCorrect);
  if (correctAnswers.length !== 1) {
    return next(new Error('Each question must have exactly one correct answer'));
  }
  if (this.options.length < 2) {
    return next(new Error('Each question must have at least 2 options'));
  }
  next();
});

// Ensure each question has at least 2 options and exactly 1 correct answer
quizSchema.pre('save', function(next) {
  for (let question of this.questions) {
    if (question.options.length < 2) {
      return next(new Error('Each question must have at least 2 options'));
    }
    const correctAnswers = question.options.filter(option => option.isCorrect);
    if (correctAnswers.length !== 1) {
      return next(new Error('Each question must have exactly one correct answer'));
    }
  }
  next();
});

const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);

export default Quiz;