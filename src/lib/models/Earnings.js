import mongoose from "mongoose";

const earningsSchema = new mongoose.Schema({
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'bank_transfer', 'other'],
    default: 'stripe'
  },
  transactionId: {
    type: String,
    required: true
  },
  stripePaymentIntentId: {
    type: String,
    sparse: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },
  platformFee: {
    type: Number,
    default: 0,
    min: 0
  },
  instructorEarnings: {
    type: Number,
    required: true,
    min: 0
  },
  payoutStatus: {
    type: String,
    enum: ['pending', 'processed', 'failed'],
    default: 'pending'
  },
  payoutDate: {
    type: Date,
    default: null
  },
  payoutTransactionId: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
earningsSchema.index({ instructor: 1, createdAt: -1 });
earningsSchema.index({ course: 1, createdAt: -1 });
earningsSchema.index({ enrollment: 1 }, { unique: true }); // One earning record per enrollment
earningsSchema.index({ transactionId: 1 });
earningsSchema.index({ status: 1 });
earningsSchema.index({ payoutStatus: 1 });

// Calculate instructor earnings (could be percentage-based)
earningsSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('amount') || this.isModified('platformFee')) {
    // If instructor earnings is not set, calculate it as amount minus platform fee
    if (!this.instructorEarnings) {
      this.instructorEarnings = Math.max(0, this.amount - this.platformFee);
    }
  }
  next();
});

// Static method to get instructor total earnings
earningsSchema.statics.getInstructorTotalEarnings = async function(instructorId) {
  const result = await this.aggregate([
    {
      $match: {
        instructor: new mongoose.Types.ObjectId(instructorId),
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: '$instructorEarnings' },
        totalTransactions: { $sum: 1 },
        pendingPayout: {
          $sum: {
            $cond: [
              { $eq: ['$payoutStatus', 'pending'] },
              '$instructorEarnings',
              0
            ]
          }
        },
        processedPayout: {
          $sum: {
            $cond: [
              { $eq: ['$payoutStatus', 'processed'] },
              '$instructorEarnings',
              0
            ]
          }
        }
      }
    }
  ]);

  return result[0] || {
    totalEarnings: 0,
    totalTransactions: 0,
    pendingPayout: 0,
    processedPayout: 0
  };
};

// Static method to get monthly earnings for an instructor
earningsSchema.statics.getMonthlyEarnings = async function(instructorId, months = 12) {
  const monthlyEarnings = [];
  
  for (let i = months - 1; i >= 0; i--) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - i);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const result = await this.aggregate([
      {
        $match: {
          instructor: new mongoose.Types.ObjectId(instructorId),
          status: 'completed',
          createdAt: { $gte: startDate, $lt: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$instructorEarnings' },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    monthlyEarnings.push({
      month: startDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
      earnings: result[0]?.totalEarnings || 0,
      transactions: result[0]?.totalTransactions || 0
    });
  }

  return monthlyEarnings;
};

const Earnings = mongoose.models.Earnings || mongoose.model('Earnings', earningsSchema);

export default Earnings;