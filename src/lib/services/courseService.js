const API_BASE_URL = '/api';

class CourseService {

  static async createCourse(courseData) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating course:', error);
      return { success: false, message: 'Network error' };
    }
  }

  static async updateCourse(courseId, courseData) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating course:', error);
      return { success: false, message: 'Network error' };
    }
  }

  static async getCourseDetailed(courseId, options = {}) {
    try {
      const searchParams = new URLSearchParams();
      
      if (options.includeReviews) {
        searchParams.append('includeReviews', 'true');
        if (options.reviewsPage) searchParams.append('reviewsPage', options.reviewsPage);
        if (options.reviewsLimit) searchParams.append('reviewsLimit', options.reviewsLimit);
      }
      
      if (options.includeEnrollmentStatus) {
        searchParams.append('includeEnrollmentStatus', 'true');
      }
      
      if (options.includeReviewEligibility) {
        searchParams.append('includeReviewEligibility', 'true');
      }
      
      const queryString = searchParams.toString();
      const url = `${API_BASE_URL}/courses/${courseId}/detailed${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching detailed course:', error);
      return { success: false, message: 'Network error' };
    }
  }

  static async getCourse(courseId, options = {}) {
    try {
      const searchParams = new URLSearchParams();
      
      if (options.includeReviews) {
        searchParams.append('includeReviews', 'true');
        if (options.reviewsPage) searchParams.append('reviewsPage', options.reviewsPage);
        if (options.reviewsLimit) searchParams.append('reviewsLimit', options.reviewsLimit);
      }
      
      const queryString = searchParams.toString();
      const url = `${API_BASE_URL}/courses/${courseId}${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching course:', error);
      return { success: false, message: 'Network error' };
    }
  }

  static async getCourses(params = {}) {
    try {
      const searchParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/courses?${searchParams}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching courses:', error);
      return { success: false, message: 'Network error' };
    }
  }

  static async deleteCourse(courseId) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error deleting course:', error);
      return { success: false, message: 'Network error' };
    }
  }


  static async uploadThumbnail(courseId, thumbnailFile, isFeatured = false) {
    try {
      const formData = new FormData();
      formData.append('thumbnail', thumbnailFile);
      formData.append('isFeatured', isFeatured);

      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/thumbnail`, {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      return { success: false, message: 'Network error' };
    }
  }


  static async createChapter(courseId, chapterData) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/chapters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chapterData),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating chapter:', error);
      return { success: false, message: 'Network error' };
    }
  }

  static async updateChapter(courseId, chapterId, chapterData) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/chapters/${chapterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chapterData),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating chapter:', error);
      return { success: false, message: 'Network error' };
    }
  }

  static async deleteChapter(courseId, chapterId) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/chapters/${chapterId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error deleting chapter:', error);
      return { success: false, message: 'Network error' };
    }
  }

  static async getChapters(courseId) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/chapters`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching chapters:', error);
      return { success: false, message: 'Network error' };
    }
  }


  static async createLesson(courseId, chapterId, lessonData) {
    try {
      let response;
      
      if (lessonData instanceof FormData) {
        // For file uploads
        response = await fetch(`${API_BASE_URL}/courses/${courseId}/chapters/${chapterId}/lessons`, {
          method: 'POST',
          body: lessonData,
        });
      } else {
        // For regular JSON data
        response = await fetch(`${API_BASE_URL}/courses/${courseId}/chapters/${chapterId}/lessons`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(lessonData),
        });
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating lesson:', error);
      return { success: false, message: 'Network error' };
    }
  }

  static async updateLesson(courseId, chapterId, lessonId, lessonData) {
    try {
      let response;
      
      if (lessonData instanceof FormData) {
        // For file uploads
        response = await fetch(`${API_BASE_URL}/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`, {
          method: 'PUT',
          body: lessonData,
        });
      } else {
        // For regular JSON data
        response = await fetch(`${API_BASE_URL}/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(lessonData),
        });
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating lesson:', error);
      return { success: false, message: 'Network error' };
    }
  }

  static async deleteLesson(courseId, chapterId, lessonId) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error deleting lesson:', error);
      return { success: false, message: 'Network error' };
    }
  }

  static async getLessons(courseId, chapterId) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/chapters/${chapterId}/lessons`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching lessons:', error);
      return { success: false, message: 'Network error' };
    }
  }


  static async deleteLesson(courseId, chapterId, lessonId) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error deleting lesson:', error);
      return { success: false, message: 'Network error' };
    }
  }

  static async reorderLessons(courseId, chapterId, lessonOrder) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/chapters/${chapterId}/lessons/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessonOrder }),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error reordering lessons:', error);
      return { success: false, message: 'Network error' };
    }
  }

  static async createFAQ(courseId, faqData) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/faqs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(faqData),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating FAQ:', error);
      return { success: false, message: 'Network error' };
    }
  }

  static async updateFAQ(courseId, faqId, faqData) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/faqs/${faqId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(faqData),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating FAQ:', error);
      return { success: false, message: 'Network error' };
    }
  }

  static async deleteFAQ(courseId, faqId) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/faqs/${faqId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      return { success: false, message: 'Network error' };
    }
  }

  static async getFAQs(courseId) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/faqs`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      return { success: false, message: 'Network error' };
    }
  }


  static async updatePricing(courseId, pricingData) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/pricing`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pricingData),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating pricing:', error);
      return { success: false, message: 'Network error' };
    }
  }


  static async publishCourse(courseId) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/publish`, {
        method: 'POST',
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error publishing course:', error);
      return { success: false, message: 'Network error' };
    }
  }


  static async updateCourseStats(courseId) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/stats`, {
        method: 'PUT',
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating course stats:', error);
      return { success: false, message: 'Network error' };
    }
  }

  static async getCourseStats(courseId) {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/stats`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching course stats:', error);
      return { success: false, message: 'Network error' };
    }
  }
}

export default CourseService;