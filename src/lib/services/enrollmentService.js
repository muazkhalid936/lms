class EnrollmentService {
  static async enrollInCourse(courseId, paymentDetails = null) {
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          paymentDetails
        }),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to enroll in course');
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'An error occurred while enrolling'
      };
    }
  }

  static async getUserEnrollments(params = {}) {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.status) searchParams.append('status', params.status);
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());

      const response = await fetch(`/api/enrollments?${searchParams.toString()}`, {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch enrollments');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'An error occurred while fetching enrollments'
      };
    }
  }

  static async checkEnrollmentStatus(courseId) {
    try {
      const response = await fetch(`/api/enrollments/${courseId}`, {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to check enrollment status');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'An error occurred while checking enrollment status'
      };
    }
  }
}

export default EnrollmentService;