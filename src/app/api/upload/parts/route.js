import { NextResponse } from 'next/server';
import { S3Client, UploadPartCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1', // Updated to match bucket region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export async function POST(request) {
  try {
    // console.log('Received request for /api/upload/parts');
    const body = await request.json();
    // console.log('Request body:', body);
    
    const { uploadId, partNumbers, filename } = body;
    
    if (!uploadId || !partNumbers || !filename) {
      console.error('Missing required parameters');
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: uploadId, partNumbers, filename'
      }, { status: 400 });
    }

    // console.log('Generating presigned URLs for:', filename);
    // console.log('Upload ID:', uploadId);
    // console.log('Part numbers:', partNumbers);

    const presignedUrls = await Promise.all(
      partNumbers.map(async (partNumber) => {
        try {
          const command = new UploadPartCommand({
            Bucket: process.env.AWS_UPLOAD_BUCKET,
            Key: filename,
            UploadId: uploadId,
            PartNumber: partNumber
          });
          
          const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
          // console.log(`Generated URL for part ${partNumber}: ${url.substring(0, 50)}...`);
          return url;
        } catch (error) {
          console.error(`Error generating URL for part ${partNumber}:`, error);
          throw error;
        }
      })
    );

    return NextResponse.json({
      success: true,
      presignedUrls
    });
  } catch (error) {
    console.error('Parts URL generation error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}