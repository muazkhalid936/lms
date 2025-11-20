import mongoose from "mongoose";

const liveClassSchema = new mongoose.Schema(
  {
    // Basic Information
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    // Course Association
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    // Instructor Reference
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Scheduling
    scheduledDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // Duration in minutes
      required: true,
      min: 15,
      max: 480, // Max 8 hours
    },

    // Agora Integration
    agoraChannelName: {
      type: String,
      required: true,
      unique: true,
    },
    agoraToken: {
      type: String,
      required: true,
    },
    agoraAppId: {
      type: String,
      required: true,
    },
    agoraUid: {
      type: Number,
      default: null,
    },

    // Meeting Settings
    maxParticipants: {
      type: Number,
      default: 100,
      min: 1,
      max: 1000,
    },
    isRecordingEnabled: {
      type: Boolean,
      default: false,
    },
    waitingRoomEnabled: {
      type: Boolean,
      default: true,
    },

    // Status and Tracking
    status: {
      type: String,
      enum: ["scheduled", "live", "completed", "cancelled"],
      default: "scheduled",
    },

    // Participants
    registeredStudents: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        registeredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Meeting Analytics
    actualStartTime: {
      type: Date,
      default: null,
    },
    actualEndTime: {
      type: Date,
      default: null,
    },
    actualDuration: {
      type: Number, // Actual duration in minutes
      default: 0,
    },
    attendees: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        joinTime: Date,
        leaveTime: Date,
        duration: Number, // Time spent in minutes
      },
    ],

    // Recording Information
    recordingUrl: {
      type: String,
      default: null,
    },
    recordingPassword: {
      type: String,
      default: null,
    },

    // Notifications
    remindersSent: {
      type: Boolean,
      default: false,
    },

    // Additional Settings
    isPublic: {
      type: Boolean,
      default: false, // Only enrolled students can join by default
    },

    // Auto-cleanup tracking
    isExpired: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient queries
liveClassSchema.index({ instructor: 1, scheduledDate: 1 });
liveClassSchema.index({ course: 1, scheduledDate: 1 });
liveClassSchema.index({ status: 1, scheduledDate: 1 });
liveClassSchema.index({ expiresAt: 1 }); // For cleanup queries

// Virtual for total registered students
liveClassSchema.virtual("totalRegistered").get(function () {
  return this.registeredStudents ? this.registeredStudents.length : 0;
});

// Virtual for total attendees
liveClassSchema.virtual("totalAttendees").get(function () {
  return this.attendees ? this.attendees.length : 0;
});

// Virtual for attendance rate
liveClassSchema.virtual("attendanceRate").get(function () {
  if (!this.registeredStudents || this.registeredStudents.length === 0)
    return 0;
  const attendeeCount = this.attendees ? this.attendees.length : 0;
  return Math.round((attendeeCount / this.registeredStudents.length) * 100);
});

// Pre-save middleware to set expiration date
liveClassSchema.pre("save", function (next) {
  // Only set expiration date when creating new document or when scheduledDate/duration is modified
  // Don't trigger this for registeredStudents updates
  if (
    this.isNew ||
    this.isModified("scheduledDate") ||
    this.isModified("duration")
  ) {
    const endTime = new Date(
      this.scheduledDate.getTime() + this.duration * 60 * 1000
    );
    this.expiresAt = new Date(endTime.getTime() + 24 * 60 * 60 * 1000); // 24 hours after end
  }

  // Auto-mark as expired if past expiration date (only check if expiresAt exists)
  if (this.expiresAt && new Date() > this.expiresAt && !this.isExpired) {
    this.isExpired = true;
    if (this.status === "scheduled") {
      this.status = "cancelled";
    }
  }

  next();
});

// Static method to cleanup expired live classes
liveClassSchema.statics.cleanupExpired = async function () {
  try {
    const now = new Date();

    // Find expired live classes that haven't been marked as expired
    const expiredClasses = await this.find({
      expiresAt: { $lt: now },
      isExpired: false,
    });

    // Mark them as expired and update status if needed
    const bulkOps = expiredClasses.map((liveClass) => ({
      updateOne: {
        filter: { _id: liveClass._id },
        update: {
          isExpired: true,
          status:
            liveClass.status === "scheduled" ? "cancelled" : liveClass.status,
        },
      },
    }));

    if (bulkOps.length > 0) {
      await this.bulkWrite(bulkOps);
      console.log(`Marked ${bulkOps.length} live classes as expired`);
    }

    // Optionally delete very old expired classes (older than 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const deleteResult = await this.deleteMany({
      expiresAt: { $lt: thirtyDaysAgo },
      isExpired: true,
    });

    if (deleteResult.deletedCount > 0) {
      console.log(
        `Deleted ${deleteResult.deletedCount} old expired live classes`
      );
    }

    return {
      markedExpired: bulkOps.length,
      deleted: deleteResult.deletedCount,
    };
  } catch (error) {
    console.error("Error cleaning up expired live classes:", error);
    throw error;
  }
};

// Method to check if class can be joined
liveClassSchema.methods.canJoin = function (userId) {
  // Check if class is live or about to start (within 15 minutes)
  const now = new Date();
  const startTime = new Date(this.scheduledDate);
  const endTime = new Date(startTime.getTime() + this.duration * 60 * 1000);
  const joinWindow = new Date(startTime.getTime() - 15 * 60 * 1000); // 15 minutes before

  if (now < joinWindow || now > endTime) {
    return { canJoin: false, reason: "Class is not currently active" };
  }

  if (this.status === "cancelled") {
    return { canJoin: false, reason: "Class has been cancelled" };
  }

  if (this.isExpired) {
    return { canJoin: false, reason: "Class has expired" };
  }

  // Check if user is registered (if not public)
  if (!this.isPublic) {
    const isRegistered = this.registeredStudents.some(
      (reg) => reg.student.toString() === userId.toString()
    );
    if (!isRegistered) {
      return {
        canJoin: false,
        reason: "You are not registered for this class",
      };
    }
  }

  return { canJoin: true };
};

// Method to register a student
liveClassSchema.methods.registerStudent = function (studentId) {
  // Check if already registered
  const isAlreadyRegistered = this.registeredStudents.some(
    (reg) => reg.student.toString() === studentId.toString()
  );

  if (isAlreadyRegistered) {
    return { success: false, message: "Student is already registered" };
  }

  // Check if class is still open for registration
  const now = new Date();
  if (now > this.scheduledDate) {
    return { success: false, message: "Registration is closed for this class" };
  }

  if (this.status === "cancelled") {
    return { success: false, message: "Cannot register for cancelled class" };
  }

  // Check capacity
  if (this.registeredStudents.length >= this.maxParticipants) {
    return { success: false, message: "Class is full" };
  }

  this.registeredStudents.push({
    student: studentId,
    registeredAt: new Date(),
  });

  return { success: true, message: "Successfully registered for class" };
};

const LiveClass =
  mongoose.models.LiveClass || mongoose.model("LiveClass", liveClassSchema);

export default LiveClass;
