// lib/services/authService.js
import { verifyToken } from '@/lib/utils/auth';
import dbConnect from '@/lib/utils/dbConnect';

/**
 * Server-side authentication service that works with cookies
 * This eliminates the need for separate verify-token and get-profile API calls
 */
class AuthService {
  /**
   * Get authenticated user from request cookies
   * This combines token verification and user fetching in one operation
   */
  static async getAuthenticatedUser(request) {
    try {
      await dbConnect();
      
      // Get token from cookies or Authorization header
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : request.cookies.get('token')?.value;

      if (!token) {
        return { success: false, message: 'No authentication token found', status: 401 };
      }

      // Verify token and get payload
      const payload = await verifyToken(token);
      
      // Import User model after DB connection
      const { default: User } = await import('@/lib/models/User');
      
      // Fetch user data
      const user = await User.findById(payload.userId);
      
      if (!user) {
        return { success: false, message: 'User not found', status: 404 };
      }

      return { 
        success: true, 
        user: user.toObject(), 
        payload,
        status: 200 
      };
    } catch (error) {
      console.error('Authentication error:', error);
      return { 
        success: false, 
        message: 'Invalid or expired token', 
        status: 401 
      };
    }
  }

  /**
   * Middleware helper to check if user has required role
   */
  static async requireRole(request, requiredRole) {
    const authResult = await this.getAuthenticatedUser(request);
    
    if (!authResult.success) {
      return authResult;
    }

    const userRole = authResult.user.userType?.toLowerCase();
    const required = requiredRole.toLowerCase();

    if (userRole !== required) {
      return {
        success: false,
        message: `Access denied. ${requiredRole} role required.`,
        status: 403
      };
    }

    return authResult;
  }

  /**
   * Client-side helper to get user from cookies without API calls
   */
  static getClientUser() {
    if (typeof window === 'undefined') return null;
    
    try {
      // Check if user data is stored in localStorage (from Zustand persist)
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        return parsed.state?.user || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting client user:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated on client side
   */
  static isClientAuthenticated() {
    if (typeof window === 'undefined') return false;
    
    // Check for token cookie
    const hasToken = document.cookie.includes('token=');
    const user = this.getClientUser();
    
    return hasToken && !!user;
  }
}

export default AuthService;