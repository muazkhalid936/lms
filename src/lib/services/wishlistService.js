class WishlistService {
  static async addToWishlist(courseId, notes = '') {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          notes
        }),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add course to wishlist');
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'An error occurred while adding to wishlist'
      };
    }
  }

  static async removeFromWishlist(courseId) {
    try {
      const response = await fetch(`/api/wishlist/${courseId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove course from wishlist');
      }

      return {
        success: true,
        message: data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'An error occurred while removing from wishlist'
      };
    }
  }

  static async getUserWishlist(params = {}) {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());

      const response = await fetch(`/api/wishlist?${searchParams.toString()}`, {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch wishlist');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'An error occurred while fetching wishlist'
      };
    }
  }

  static async checkWishlistStatus(courseId) {
    try {
      const response = await fetch(`/api/wishlist/${courseId}`, {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to check wishlist status');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'An error occurred while checking wishlist status'
      };
    }
  }

  static async toggleWishlist(courseId) {
    try {
      // First check if it's in wishlist
      const statusResult = await this.checkWishlistStatus(courseId);
      
      if (!statusResult.success) {
        return statusResult;
      }

      const isInWishlist = statusResult.data.isInWishlist;

      if (isInWishlist) {
        // Remove from wishlist
        return await this.removeFromWishlist(courseId);
      } else {
        // Add to wishlist
        return await this.addToWishlist(courseId);
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'An error occurred while toggling wishlist'
      };
    }
  }
}

export default WishlistService;