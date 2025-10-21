import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import Lesson from '@/lib/models/Lesson';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const { id, chapterId } = await params;
    const { lessonOrder } = await request.json();
    
    if (!lessonOrder || !Array.isArray(lessonOrder)) {
      return NextResponse.json(
        { success: false, message: 'Invalid lesson order data' },
        { status: 400 }
      );
    }

    // Update the order for each lesson
    const updatePromises = lessonOrder.map((lessonId, index) => {
      return Lesson.findByIdAndUpdate(
        lessonId,
        { order: index + 1 },
        { new: true }
      );
    });

    await Promise.all(updatePromises);

    // Return the updated lessons
    const updatedLessons = await Lesson.find({ 
      course: id, 
      chapter: chapterId 
    }).sort({ order: 1 });

    return NextResponse.json({
      success: true,
      message: 'Lessons reordered successfully',
      data: updatedLessons
    });

  } catch (error) {
    console.error('Lesson reorder error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}