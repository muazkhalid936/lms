import { NextResponse } from 'next/server';
import { S3Client, CreateMultipartUploadCommand } from '@aws-sdk/client-s3';

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
    const { filename, contentType } = body;

    if (!filename) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: filename'
      }, { status: 400 });
    }

    const command = new CreateMultipartUploadCommand({
      Bucket: process.env.AWS_UPLOAD_BUCKET,
      Key: filename,
      ContentType: contentType || 'application/octet-stream'
    });

    const result = await s3Client.send(command);

    return NextResponse.json({
      success: true,
      uploadId: result.UploadId,
      key: result.Key
    });
  } catch (error) {
    console.error('Multipart upload initiation error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}