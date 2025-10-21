import { NextResponse } from "next/server";
import dbConnect from "@/lib/utils/dbConnect";
import QuizResult from "@/lib/models/QuizResult";
import User from "@/lib/models/User";
import { verifyToken } from "@/lib/utils/auth";

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    // Await params before using its properties
    const { id } = await params;
    
    // Get authorization token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token and get user info
    let user;
    try {
      const payload = await verifyToken(token);
      user = await User.findById(payload.userId);
      
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get quiz attempts for this user and quiz
    const attempts = await QuizResult.find({ 
      quiz: id, 
      student: user._id 
    }).sort({ attemptNumber: -1 });

    return NextResponse.json({
      success: true,
      data: {
        attempts: attempts.length,
        latestAttempt: attempts.length > 0 ? attempts[0] : null,
        hasAttempted: attempts.length > 0
      }
    });
  } catch (error) {
    console.error("Error fetching quiz attempts:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}