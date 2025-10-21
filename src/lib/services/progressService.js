class ProgressService {
  static async getCourseProgress(courseId) {
    try {
      const response = await fetch(`/api/courses/${courseId}/progress`, {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch course progress');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'An error occurred while fetching progress'
      };
    }
  }

  static async markLessonComplete(courseId, lessonId) {
    try {
      const response = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to mark lesson as complete');
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'An error occurred while marking lesson complete'
      };
    }
  }

  static async isLessonAccessible(courseId, lessonId, progressData) {
    if (!progressData || !progressData.accessibleLessons) {
      return false;
    }
    
    return progressData.accessibleLessons[lessonId] || false;
  }

  static async isQuizAccessible(courseId, quizId, progressData) {
    if (!progressData || !progressData.canAccessQuizzes) {
      return false;
    }
    
    return progressData.canAccessQuizzes[quizId] || false;
  }
}

export default ProgressService;