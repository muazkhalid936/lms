import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import Course from '@/lib/models/Course';
import Chapter from '@/lib/models/Chapter';
import Lesson from '@/lib/models/Lesson';
import Quiz from '@/lib/models/Quiz';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    
    const chapters = await Chapter.find({ course: id })
      .populate({
        path: 'lessons',
        options: { sort: { order: 1 } }
      })
      .populate({
        path: 'quizzes',
        options: { sort: { order: 1 } }
      })
      .sort({ order: 1 });

      console.log('Fetched chapters:', chapters);

    return NextResponse.json({
      success: true,
      data: chapters
    });

  } catch (error) {
    console.error('Chapters fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const body = await request.json();
    const { title, description, isFree } = body;

    // Validation
    if (!title) {
      return NextResponse.json(
        { success: false, message: 'Chapter title is required' },
        { status: 400 }
      );
    }

    // Check if course exists
    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      );
    }

    // Get the next order number
    const lastChapter = await Chapter.findOne({ course: id }).sort({ order: -1 });
    const order = lastChapter ? lastChapter.order + 1 : 1;

    // Create new chapter
    const chapter = new Chapter({
      title,
      description: description || '',
      course: id,
      order,
      isFree: isFree || false
    });

    const savedChapter = await chapter.save();

    return NextResponse.json({
      success: true,
      message: 'Chapter created successfully',
      data: savedChapter
    }, { status: 201 });

  } catch (error) {
    console.error('Chapter creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}