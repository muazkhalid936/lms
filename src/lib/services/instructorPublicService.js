class InstructorPublicService {
  static get baseUrl() {
    return process.env.FRONTEND_URL || 'http://localhost:3000';
  }

  static async getAllInstructors(params = {}) {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());

      const response = await fetch(`${this.baseUrl}/api/public/instructors?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch instructors');
      }

      return result;
    } catch (error) {
      console.error('Error fetching instructors:', error);
      return { 
        success: false, 
        message: error.message || 'Network error while fetching instructors' 
      };
    }
  }

  static async getInstructorById(instructorId) {
    try {
      console.log(instructorId);
      const response = await fetch(`${this.baseUrl}/api/public/instructor/${instructorId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Response:', response);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch instructor');
      }

      return result;
    } catch (error) {
      console.error('Error fetching instructor:', error);
      return { 
        success: false, 
        message: error.message || 'Network error while fetching instructor' 
      };
    }
  }

  static async getInstructorCourses(instructorId, params = {}) {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());

      const response = await fetch(`${this.baseUrl}/api/public/instructor/${instructorId}/courses?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch instructor courses');
      }

      return result;
    } catch (error) {
      console.error('Error fetching instructor courses:', error);
      return { 
        success: false, 
        message: error.message || 'Network error while fetching instructor courses' 
      };
    }
  }

  static async getInstructorStats(instructorId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/public/instructor/${instructorId}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch instructor stats');
      }

      return result;
    } catch (error) {
      console.error('Error fetching instructor stats:', error);
      return { 
        success: false, 
        message: error.message || 'Network error while fetching instructor stats' 
      };
    }
  }
}

export default InstructorPublicService;