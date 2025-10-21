import { NextResponse } from 'next/server';
import { generateSignedUrl } from '@/lib/services/awsService';

export async function GET(request, { params }) {
  try {
    const { key } = await params;
    
    if (!key) {
      return NextResponse.json(
        { success: false, message: 'File key is required' },
        { status: 400 }
      );
    }

    // Decode the key if it was URL encoded
    const decodedKey = decodeURIComponent(key);
    
    // Generate a signed URL for the file
    const result = await generateSignedUrl(decodedKey, 3600); // 1 hour expiration
    
    if (result.success) {
      // Redirect to the signed URL
      return NextResponse.redirect(result.url);
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to generate file URL' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('File access error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}