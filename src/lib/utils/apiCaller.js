import axios from 'axios';

class ApiCaller {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Create axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 seconds timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        return response.data;
      },
      (error) => {
        if (error.response) {
          // Server responded with error status
          const errorMessage = error.response.data?.message || 'An error occurred';
          return Promise.reject({
            message: errorMessage,
            status: error.response.status,
            data: error.response.data,
          });
        } else if (error.request) {
          // Request was made but no response received
          return Promise.reject({
            message: 'Network error - no response received',
            status: 0,
          });
        } else {
          // Something else happened
          return Promise.reject({
            message: error.message || 'An unexpected error occurred',
            status: 0,
          });
        }
      }
    );
  }

  // Get auth token from localStorage
  getAuthToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  // GET request
  async get(url, config = {}) {
    try {
      return await this.client.get(url, config);
    } catch (error) {
      throw error;
    }
  }

  // POST request
  async post(url, data = {}, config = {}) {
    try {
      return await this.client.post(url, data, config);
    } catch (error) {
      throw error;
    }
  }

  // PUT request
  async put(url, data = {}, config = {}) {
    try {
      return await this.client.put(url, data, config);
    } catch (error) {
      throw error;
    }
  }

  // DELETE request
  async delete(url, config = {}) {
    try {
      return await this.client.delete(url, config);
    } catch (error) {
      throw error;
    }
  }

  // PATCH request
  async patch(url, data = {}, config = {}) {
    try {
      return await this.client.patch(url, data, config);
    } catch (error) {
      throw error;
    }
  }
}

// Create and export a singleton instance
const apiCaller = new ApiCaller();
export default apiCaller;