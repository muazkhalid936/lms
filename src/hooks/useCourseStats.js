import { useState, useCallback } from 'react';
import CourseService from '@/lib/services/courseService';

const useCourseStats = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const updateCourseStats = useCallback(async (courseId) => {
    setIsUpdating(true);
    setError(null);
    
    try {
      const result = await CourseService.updateCourseStats(courseId);
      if (!result.success) {
        throw new Error(result.message || 'Failed to update course stats');
      }
      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const getCourseStats = useCallback(async (courseId) => {
    try {
      const result = await CourseService.getCourseStats(courseId);
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch course stats');
      }
      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    updateCourseStats,
    getCourseStats,
    isUpdating,
    error
  };
};

export default useCourseStats;