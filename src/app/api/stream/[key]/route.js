import { NextResponse } from 'next/server';
import { generateSignedUrl } from '@/lib/services/awsService';

export async function GET(request, { params }) {
  try {
    const { key } = await params;
    
    if (!key) {
      return NextResponse.json(
        { success: false, message: 'Video key is required' },
        { status: 400 }
      );
    }

    // Decode the key if it was URL encoded
    const decodedKey = decodeURIComponent(key);
    
    // Generate a signed URL for the video file
    const result = await generateSignedUrl(decodedKey, 3600); // 1 hour expiration
    
    if (result.success) {
      // For video streaming, we need to handle range requests
      const range = request.headers.get('range');
      
      if (range) {
        // If there's a range request, we should proxy it to S3
        // For now, we'll redirect to the signed URL and let the browser handle it
        return NextResponse.redirect(result.url);
      } else {
        // For regular requests, redirect to the signed URL
        return NextResponse.redirect(result.url);
      }
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to generate video stream URL' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Video streaming error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}