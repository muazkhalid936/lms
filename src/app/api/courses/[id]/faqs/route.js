import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import Course from '@/lib/models/Course';
import FAQ from '@/lib/models/FAQ';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    
    const faqs = await FAQ.find({ course: id }).sort({ order: 1 });

    return NextResponse.json({
      success: true,
      data: faqs
    });

  } catch (error) {
    console.error('FAQs fetch error:', error);
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
    const { question, answer } = body;

    // Validation
    if (!question || !answer) {
      return NextResponse.json(
        { success: false, message: 'Question and answer are required' },
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
    const lastFaq = await FAQ.findOne({ course: id }).sort({ order: -1 });
    const order = lastFaq ? lastFaq.order + 1 : 1;

    // Create new FAQ
    const faq = new FAQ({
      question,
      answer,
      course: id,
      order
    });

    const savedFaq = await faq.save();

    return NextResponse.json({
      success: true,
      message: 'FAQ created successfully',
      data: savedFaq
    }, { status: 201 });

  } catch (error) {
    console.error('FAQ creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}