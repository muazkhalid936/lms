import dbConnect from '@/lib/utils/dbConnect';
import LiveClass from '@/lib/models/LiveClass';
import zoomService from './zoomService';

class CleanupService {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.cleanupInterval = 60 * 60 * 1000; // Run every hour (60 minutes)
  }

  /**
   * Start the automatic cleanup service
   */
  start() {
    if (this.isRunning) {
      console.log('Cleanup service is already running');
      return;
    }

    console.log('Starting LiveClass cleanup service...');
    this.isRunning = true;

    // Run cleanup immediately on start
    this.runCleanup();

    // Set up recurring cleanup
    this.intervalId = setInterval(() => {
      this.runCleanup();
    }, this.cleanupInterval);

    console.log(`Cleanup service started. Will run every ${this.cleanupInterval / 1000 / 60} minutes.`);
  }

  /**
   * Stop the automatic cleanup service
   */
  stop() {
    if (!this.isRunning) {
      console.log('Cleanup service is not running');
      return;
    }

    console.log('Stopping LiveClass cleanup service...');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    console.log('Cleanup service stopped');
  }

  /**
   * Run the cleanup process
   */
  async runCleanup() {
    try {
      console.log('Running LiveClass cleanup...');
      await dbConnect();

      const result = await this.cleanupExpiredLiveClasses();
      
      if (result.deletedCount > 0) {
        console.log(`Cleanup completed: ${result.deletedCount} expired live classes removed`);
      } else {
        console.log('Cleanup completed: No expired live classes found');
      }

      return result;
    } catch (error) {
      console.error('Error during cleanup:', error);
      throw error;
    }
  }

  /**
   * Clean up expired live classes
   */
  async cleanupExpiredLiveClasses() {
    try {
      const now = new Date();
      
      // Find expired live classes that haven't been cleaned up yet
      const expiredClasses = await LiveClass.find({
        expiresAt: { $lte: now },
        isCleanedUp: { $ne: true }
      }).select('_id zoomMeetingId title scheduledDate status');

      console.log(`Found ${expiredClasses.length} expired live classes to clean up`);

      let deletedCount = 0;
      let zoomDeletionErrors = [];

      for (const liveClass of expiredClasses) {
        try {
          // Delete from Zoom if meeting exists
          if (liveClass.zoomMeetingId) {
            try {
              await zoomService.deleteMeeting(liveClass.zoomMeetingId);
              console.log(`Deleted Zoom meeting ${liveClass.zoomMeetingId} for class: ${liveClass.title}`);
            } catch (zoomError) {
              // Log zoom deletion error but continue with database cleanup
              console.warn(`Failed to delete Zoom meeting ${liveClass.zoomMeetingId}:`, zoomError.message);
              zoomDeletionErrors.push({
                classId: liveClass._id,
                zoomMeetingId: liveClass.zoomMeetingId,
                error: zoomError.message
              });
            }
          }

          // Delete from database
          await LiveClass.findByIdAndDelete(liveClass._id);
          deletedCount++;
          
          console.log(`Deleted expired live class: ${liveClass.title} (scheduled: ${liveClass.scheduledDate})`);
        } catch (error) {
          console.error(`Failed to delete live class ${liveClass._id}:`, error);
        }
      }

      const result = {
        deletedCount,
        totalFound: expiredClasses.length,
        zoomDeletionErrors,
        timestamp: now
      };

      // Log summary
      if (zoomDeletionErrors.length > 0) {
        console.warn(`Cleanup completed with ${zoomDeletionErrors.length} Zoom deletion errors`);
      }

      return result;
    } catch (error) {
      console.error('Error in cleanupExpiredLiveClasses:', error);
      throw error;
    }
  }

  /**
   * Manual cleanup trigger (for testing or manual execution)
   */
  async manualCleanup() {
    console.log('Manual cleanup triggered');
    return await this.runCleanup();
  }

  /**
   * Get cleanup service status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalMinutes: this.cleanupInterval / 1000 / 60,
      nextRunEstimate: this.isRunning && this.intervalId ? 
        new Date(Date.now() + this.cleanupInterval) : null
    };
  }

  /**
   * Update cleanup interval (in minutes)
   */
  setCleanupInterval(minutes) {
    const newInterval = minutes * 60 * 1000;
    
    if (newInterval < 60000) { // Minimum 1 minute
      throw new Error('Cleanup interval must be at least 1 minute');
    }

    this.cleanupInterval = newInterval;
    
    // Restart service with new interval if it's running
    if (this.isRunning) {
      this.stop();
      this.start();
    }

    console.log(`Cleanup interval updated to ${minutes} minutes`);
  }
}

// Create singleton instance
const cleanupService = new CleanupService();

export default cleanupService;