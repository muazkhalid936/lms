import { NextResponse } from 'next/server';
import dbConnect from '@/lib/utils/dbConnect';
import FAQ from '@/lib/models/FAQ';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const { id, faqId } = await params;
    const body = await request.json();

    const faq = await FAQ.findOne({ _id: faqId, course: id });
    if (!faq) {
      return NextResponse.json(
        { success: false, message: 'FAQ not found' },
        { status: 404 }
      );
    }

    // Update FAQ
    Object.assign(faq, body);
    const updatedFaq = await faq.save();

    return NextResponse.json({
      success: true,
      message: 'FAQ updated successfully',
      data: updatedFaq
    });

  } catch (error) {
    console.error('FAQ update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const { id, faqId } = await params;

    const faq = await FAQ.findOne({ _id: faqId, course: id });
    if (!faq) {
      return NextResponse.json(
        { success: false, message: 'FAQ not found' },
        { status: 404 }
      );
    }

    await FAQ.findByIdAndDelete(faqId);

    return NextResponse.json({
      success: true,
      message: 'FAQ deleted successfully'
    });

  } catch (error) {
    console.error('FAQ deletion error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}