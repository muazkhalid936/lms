import mongoose from 'mongoose';
import Course from '@/lib/models/Course';
import Lesson from '@/lib/models/Lesson';
import Quiz from '@/lib/models/Quiz';

/**
 * Calculate and update course statistics
 * @param {string} courseId - The course ID
 * @returns {Promise<Object|null>} Updated stats or null if failed
 */
export async function calculateAndUpdateCourseStats(courseId) {
  try {
    //console.log('🔄 Starting stats calculation for course:', courseId);
    
    // Get the course
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    //console.log('📚 Found course:', course.courseTitle);

    // Get all lessons and quizzes for this course
    const lessons = await Lesson.find({ course: courseId });
    const quizzes = await Quiz.find({ course: courseId });
    //console.log('📝 Found lessons:', lessons.length);
    //console.log('❓ Found quizzes:', quizzes.length);
    
    // Calculate total lessons and quizzes
    const totalLessons = lessons.length;
    const totalQuizzes = quizzes.length;
    //console.log('🔢 Calculated totalLessons:', totalLessons);
    //console.log('🔢 Calculated totalQuizzes:', totalQuizzes);
    
    // Calculate total duration
    let totalSeconds = 0;
    lessons.forEach((lesson, index) => {
      const lessonSeconds = (lesson.duration.hours * 3600) + 
                           (lesson.duration.minutes * 60) + 
                           (lesson.duration.seconds || 0);
      totalSeconds += lessonSeconds;
      //console.log(`📖 Lesson ${index + 1}: ${lesson.title} - ${lessonSeconds}s`);
    });
    
    // Convert total seconds to hours, minutes, seconds
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const totalDuration = {
      hours: hours,
      minutes: minutes,
      seconds: seconds
    };
    
    //console.log('⏱️ Calculated totalDuration:', totalDuration);
    
    // Update the course
    course.totalLessons = totalLessons;
    course.totalQuizzes = totalQuizzes;
    course.totalDuration = totalDuration;
    
    //console.log('💾 Saving course with stats...');
    await course.save();
    //console.log('✅ Course stats updated successfully');
    
    return { totalLessons, totalQuizzes, totalDuration };
  } catch (error) {
    console.error('❌ Error calculating course stats:', error);
    return null;
  }
}

/**
 * Format duration for display
 * @param {Object} duration - Duration object with hours, minutes, seconds
 * @returns {string} Formatted duration string
 */
export function formatDuration(duration) {
  if (!duration) return '0s';
  
  const h = duration.hours || 0;
  const m = duration.minutes || 0;
  const s = duration.seconds || 0;
  
  if (h > 0) {
    return `${h}h ${m}m`;
  } else if (m > 0) {
    return `${m}m ${s}s`;
  } else {
    return `${s}s`;
  }
}