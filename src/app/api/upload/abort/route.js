import { NextResponse } from 'next/server';
import { S3Client, AbortMultipartUploadCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { uploadId, filename } = body;

    if (!uploadId || !filename) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: uploadId, filename'
      }, { status: 400 });
    }

    const command = new AbortMultipartUploadCommand({
      Bucket: process.env.AWS_UPLOAD_BUCKET,
      Key: filename,
      UploadId: uploadId
    });

    await s3Client.send(command);

    return NextResponse.json({
      success: true,
      message: 'Multipart upload aborted successfully'
    });
  } catch (error) {
    console.error('Multipart upload abort error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}