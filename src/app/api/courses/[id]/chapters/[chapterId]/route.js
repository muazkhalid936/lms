import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import Chapter from '@/lib/models/Chapter';
import Lesson from '@/lib/models/Lesson';
import { deleteFromS3 } from '@/lib/services/awsService';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id, chapterId } = await params;
    
    const chapter = await Chapter.findOne({ _id: chapterId, course: id })
      .populate({
        path: 'lessons',
        options: { sort: { order: 1 } }
      });

    if (!chapter) {
      return NextResponse.json(
        { success: false, message: 'Chapter not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: chapter
    });

  } catch (error) {
    console.error('Chapter fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const { id, chapterId } = await params;
    const body = await request.json();

    const chapter = await Chapter.findOne({ _id: chapterId, course: id });
    if (!chapter) {
      return NextResponse.json(
        { success: false, message: 'Chapter not found' },
        { status: 404 }
      );
    }

    // Update chapter
    Object.assign(chapter, body);
    const updatedChapter = await chapter.save();

    return NextResponse.json({
      success: true,
      message: 'Chapter updated successfully',
      data: updatedChapter
    });

  } catch (error) {
    console.error('Chapter update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const { id, chapterId } = await params;

    const chapter = await Chapter.findOne({ _id: chapterId, course: id });
    if (!chapter) {
      return NextResponse.json(
        { success: false, message: 'Chapter not found' },
        { status: 404 }
      );
    }

    // Get all lessons in this chapter to delete their files
    const lessons = await Lesson.find({ chapter: chapterId });

    // Delete lesson files from S3
    for (const lesson of lessons) {
      if (lesson.content.videoKey) {
        await deleteFromS3(lesson.content.videoKey);
      }
      if (lesson.content.documentKey) {
        await deleteFromS3(lesson.content.documentKey);
      }
      if (lesson.content.thumbnailKey) {
        await deleteFromS3(lesson.content.thumbnailKey);
      }
      // Delete attachments
      for (const attachment of lesson.attachments) {
        if (attachment.key) {
          await deleteFromS3(attachment.key);
        }
      }
    }

    // Delete all lessons in this chapter
    await Lesson.deleteMany({ chapter: chapterId });
    
    // Delete the chapter
    await Chapter.findByIdAndDelete(chapterId);

    return NextResponse.json({
      success: true,
      message: 'Chapter and all lessons deleted successfully'
    });

  } catch (error) {
    console.error('Chapter deletion error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}