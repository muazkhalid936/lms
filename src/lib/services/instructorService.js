class InstructorService {
  static async getInstructorStats() {
    try {
      const response = await fetch('/api/instructor/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // This ensures cookies are sent
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch instructor statistics');
      }

      return result;
    } catch (error) {
      console.error('Error fetching instructor stats:', error);
      throw error;
    }
  }

  static async getInstructorEarnings(period = '30days') {
    try {
      const response = await fetch(`/api/instructor/earnings?period=${period}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // This ensures cookies are sent
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch instructor earnings');
      }

      return result;
    } catch (error) {
      console.error('Error fetching instructor earnings:', error);
      throw error;
    }
  }

  static async getInstructorCourseStats() {
    try {
      const response = await fetch('/api/instructor/courses/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // This ensures cookies are sent
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch course statistics');
      }

      return result;
    } catch (error) {
      console.error('Error fetching course stats:', error);
      throw error;
    }
  }
}

export default InstructorService;