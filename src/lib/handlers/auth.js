// lib/handlers/auth.js
import { verifyToken } from '@/lib/utils/auth';
import User from '@/lib/models/User';
import dbConnect from '@/lib/utils/dbConnect';

export async function verifyAuth(request) {
  try {
    let token = null;
    
    // First, try to get the token from authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
    
    // If no authorization header, try to get the token from cookies
    if (!token) {
      token = request.cookies.get('token')?.value;
    }
    
    if (!token) {
      return null;
    }

    // Verify the token
    const decoded = await verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      return null;
    }

    // Connect to database and fetch user
    await dbConnect();
    const user = await User.findById(decoded.userId).select('_id name email userType avatar');
    
    if (!user) {
      return null;
    }

    return {
      _id: user._id,
      userId: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      avatar: user.avatar
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}