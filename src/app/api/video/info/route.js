import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const videoKey = searchParams.get('key');

    if (!videoKey) {
      return Response.json({ error: "Video key is required" }, { status: 400 });
    }

    // Get file info from S3
    const head = await s3.send(new HeadObjectCommand({
      Bucket: process.env.AWS_UPLOAD_BUCKET,
      Key: videoKey,
    }));

    const fileInfo = {
      key: videoKey,
      size: Number(head.ContentLength),
      contentType: head.ContentType,
      lastModified: head.LastModified,
      metadata: head.Metadata,
      bucket: process.env.AWS_UPLOAD_BUCKET,
      streamingUrl: `/api/video?key=${encodeURIComponent(videoKey)}`,
      sizeMB: (Number(head.ContentLength) / (1024 * 1024)).toFixed(2),
    };

    return Response.json({
      success: true,
      fileInfo: fileInfo
    });

  } catch (error) {
    console.error("Video info error:", error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 404 });
  }
}