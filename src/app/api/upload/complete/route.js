import { NextResponse } from 'next/server';
import { S3Client, CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';

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
    const { uploadId, filename, parts } = body;

    if (!uploadId || !filename || !parts) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: uploadId, filename, parts'
      }, { status: 400 });
    }

    const command = new CompleteMultipartUploadCommand({
      Bucket: process.env.AWS_UPLOAD_BUCKET,
      Key: filename,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.map(part => ({
          ETag: part.ETag,
          PartNumber: part.PartNumber
        }))
      }
    });

    const result = await s3Client.send(command);

    // Construct the public URL
    const url = `https://${process.env.AWS_UPLOAD_BUCKET}.s3.${process.env.AWS_REGION || 'eu-north-1'}.amazonaws.com/${filename}`;

    return NextResponse.json({
      success: true,
      url: url,
      key: result.Key,
      location: result.Location
    });
  } catch (error) {
    console.error('Multipart upload completion error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}