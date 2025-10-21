import { NextResponse } from 'next/server';
import { S3Client, CreateMultipartUploadCommand, UploadPartCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_UPLOAD_BUCKET || 'abdoo-podcast-uploads';

// Generate unique filename
const generateFileName = (originalName, prefix = '') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `${prefix}${timestamp}-${random}.${extension}`;
};

export async function POST(request) {
  try {
    const { filename, fileType, fileSize, folder = 'lesson-videos' } = await request.json();
    
    if (!filename || !fileType || !fileSize) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const key = generateFileName(filename, `${folder}/`);
    const chunkSize = 5 * 1024 * 1024; // 5MB chunks
    const totalParts = Math.ceil(fileSize / chunkSize);

    // Create multipart upload
    const createCommand = new CreateMultipartUploadCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

    const createResult = await s3Client.send(createCommand);
    const uploadId = createResult.UploadId;

    // Generate presigned URLs for each part
    const presignedUrls = [];
    for (let i = 1; i <= totalParts; i++) {
      const uploadPartCommand = new UploadPartCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        PartNumber: i,
        UploadId: uploadId,
      });

      const presignedUrl = await getSignedUrl(s3Client, uploadPartCommand, {
        expiresIn: 3600, // 1 hour
      });

      presignedUrls.push({
        partNumber: i,
        url: presignedUrl,
      });
    }

    return NextResponse.json({
      success: true,
      uploadId,
      key,
      presignedUrls,
      chunkSize,
      totalParts,
    });

  } catch (error) {
    console.error('Presigned multipart upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}