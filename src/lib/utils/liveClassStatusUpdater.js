import dbConnect from '@/lib/utils/dbConnect';
import LiveClass from '@/lib/models/LiveClass';

/**
 * Updates live class statuses based on current time
 * - Changes 'scheduled' to 'live' when scheduled time arrives
 * - Changes 'live' to 'completed' when scheduled end time passes
 */
export async function updateLiveClassStatuses() {
  try {
    await dbConnect();
    
    const now = new Date();
    const updates = [];

    // Find classes that should be live (scheduled time has passed but not ended)
    const scheduledClasses = await LiveClass.find({
      status: 'scheduled',
      scheduledDate: { $lte: now },
      isExpired: false
    });

    for (const liveClass of scheduledClasses) {
      const scheduledEndTime = new Date(
        liveClass.scheduledDate.getTime() + (liveClass.duration * 60 * 1000)
      );
      
      // If current time is past the end time, mark as completed
      if (now > scheduledEndTime) {
        updates.push({
          updateOne: {
            filter: { _id: liveClass._id },
            update: { 
              status: 'completed',
              actualEndTime: scheduledEndTime
            }
          }
        });
      } else {
        // If current time is past start time but before end time, mark as live
        updates.push({
          updateOne: {
            filter: { _id: liveClass._id },
            update: { 
              status: 'live',
              actualStartTime: liveClass.scheduledDate
            }
          }
        });
      }
    }

    // Find live classes that should be completed (end time has passed)
    const liveClasses = await LiveClass.find({
      status: 'live',
      isExpired: false
    });

    for (const liveClass of liveClasses) {
      const scheduledEndTime = new Date(
        liveClass.scheduledDate.getTime() + (liveClass.duration * 60 * 1000)
      );
      
      // If current time is past the end time, mark as completed
      if (now > scheduledEndTime) {
        const actualDuration = liveClass.actualStartTime 
          ? Math.round((scheduledEndTime - liveClass.actualStartTime) / (1000 * 60))
          : liveClass.duration;

        updates.push({
          updateOne: {
            filter: { _id: liveClass._id },
            update: { 
              status: 'completed',
              actualEndTime: scheduledEndTime,
              actualDuration: actualDuration
            }
          }
        });
      }
    }

    // Execute bulk updates if there are any
    if (updates.length > 0) {
      await LiveClass.bulkWrite(updates);
      console.log(`Updated ${updates.length} live class statuses`);
      return { updated: updates.length };
    }

    return { updated: 0 };

  } catch (error) {
    console.error('Error updating live class statuses:', error);
    throw error;
  }
}

/**
 * Middleware function to update statuses before fetching classes
 */
export async function withStatusUpdate(fetchFunction) {
  try {
    // Update statuses first
    await updateLiveClassStatuses();
    
    // Then execute the original fetch function
    return await fetchFunction();
  } catch (error) {
    console.error('Error in withStatusUpdate:', error);
    // Continue with fetch even if status update fails
    return await fetchFunction();
  }
}