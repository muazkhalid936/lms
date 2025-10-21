import dbConnect from './dbConnect';
import Course from '@/lib/models/Course';
import Enrollment from '@/lib/models/Enrollment';
import Chapter from '@/lib/models/Chapter';
import Lesson from '@/lib/models/Lesson';

/**
 * Get instructor statistics including courses, lessons, duration, and students
 * @param {string} instructorId - The instructor's user ID
 * @returns {Object} Statistics object
 */
export async function getInstructorPublicStats(instructorId) {
  try {
    await dbConnect();

    // Get all published courses by this instructor
    const instructorCourses = await Course.find({ 
      instructor: instructorId,
      status: 'published'
    }).select('_id courseTitle courseDuration');

    const courseIds = instructorCourses.map(course => course._id);
    const totalCourses = instructorCourses.length;

    // Get total enrollments for instructor's courses
    const totalEnrollments = await Enrollment.countDocuments({
      course: { $in: courseIds },
      status: { $in: ['active', 'completed'] }
    });

    // Get all chapters for instructor's courses
    const chapters = await Chapter.find({
      course: { $in: courseIds }
    }).select('_id');

    const chapterIds = chapters.map(chapter => chapter._id);

    // Get total lessons count
    const totalLessons = await Lesson.countDocuments({
      chapter: { $in: chapterIds }
    });

    // Calculate total course duration
    let totalDuration = 0;
    
    // Try to get duration from course field first
    instructorCourses.forEach(course => {
      if (course.courseDuration) {
        // If duration is stored as a number (minutes), add it
        if (typeof course.courseDuration === 'number') {
          totalDuration += course.courseDuration;
        }
        // If duration is stored as string, try to parse it
        else if (typeof course.courseDuration === 'string') {
          const duration = parseDurationString(course.courseDuration);
          totalDuration += duration;
        }
      }
    });

    // If no course duration data, calculate from lessons
    if (totalDuration === 0) {
      const lessons = await Lesson.find({
        chapter: { $in: chapterIds }
      }).select('duration');

      lessons.forEach(lesson => {
        if (lesson.duration) {
          if (typeof lesson.duration === 'number') {
            totalDuration += lesson.duration;
          } else if (typeof lesson.duration === 'string') {
            const duration = parseDurationString(lesson.duration);
            totalDuration += duration;
          }
        }
      });
    }

    return {
      totalCourses,
      totalLessons,
      totalDuration: formatDuration(totalDuration),
      totalStudents: totalEnrollments
    };

  } catch (error) {
    console.error('Error fetching instructor stats:', error);
    return {
      totalCourses: 0,
      totalLessons: 0,
      totalDuration: '0min',
      totalStudents: 0
    };
  }
}

/**
 * Parse duration string and convert to minutes
 * @param {string} durationStr - Duration string like "1hr 30min", "45min", "2hrs"
 * @returns {number} Duration in minutes
 */
function parseDurationString(durationStr) {
  if (!durationStr || typeof durationStr !== 'string') return 0;
  
  let totalMinutes = 0;
  
  // Match hours (1hr, 2hrs, 1h, 2h)
  const hoursMatch = durationStr.match(/(\d+)\s*h(?:rs?)?/i);
  if (hoursMatch) {
    totalMinutes += parseInt(hoursMatch[1]) * 60;
  }
  
  // Match minutes (30min, 45m)
  const minutesMatch = durationStr.match(/(\d+)\s*m(?:in)?/i);
  if (minutesMatch) {
    totalMinutes += parseInt(minutesMatch[1]);
  }
  
  // If no matches, try to parse as just a number (assume minutes)
  if (totalMinutes === 0) {
    const numberMatch = durationStr.match(/^\d+$/);
    if (numberMatch) {
      totalMinutes = parseInt(numberMatch[0]);
    }
  }
  
  return totalMinutes;
}

/**
 * Format duration in minutes to human readable format
 * @param {number} totalMinutes - Total duration in minutes
 * @returns {string} Formatted duration like "1hr 30min", "45min"
 */
function formatDuration(totalMinutes) {
  if (totalMinutes < 60) {
    return `${totalMinutes}min`;
  }
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (minutes === 0) {
    return hours === 1 ? '1hr' : `${hours}hrs`;
  }
  
  return `${hours}hr ${minutes}min`;
}