class ReviewService {
  static async checkReviewEligibility(courseId) {
    try {
      const response = await fetch(`/api/courses/${courseId}/reviews/eligibility`, {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to check review eligibility');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'An error occurred while checking review eligibility'
      };
    }
  }

  static async postReview(courseId, reviewData) {
    try {
      const response = await fetch(`/api/courses/${courseId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(reviewData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to post review');
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'An error occurred while posting the review'
      };
    }
  }

  static async getCourseReviews(courseId, { page = 1, limit = 10 } = {}) {
    try {
      const response = await fetch(`/api/courses/${courseId}/reviews?page=${page}&limit=${limit}`, {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch reviews');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'An error occurred while fetching reviews'
      };
    }
  }

  static async updateReview(courseId, reviewData) {
    try {
      const response = await fetch(`/api/courses/${courseId}/reviews`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(reviewData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update review');
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'An error occurred while updating the review'
      };
    }
  }

  static async deleteReview(courseId) {
    try {
      const response = await fetch(`/api/courses/${courseId}/reviews`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete review');
      }

      return {
        success: true,
        message: data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'An error occurred while deleting the review'
      };
    }
  }
}

export default ReviewService;