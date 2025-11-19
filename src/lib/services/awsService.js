import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configure AWS S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1", // Updated to match bucket region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_UPLOAD_BUCKET || "abdoo-podcast-uploads";

// Generate unique filename
const generateFileName = (originalName, prefix = "") => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split(".").pop();
  return `${prefix}${timestamp}-${random}.${extension}`;
};

// Upload file to S3
export const uploadToS3 = async (file, folder = "courses") => {
  try {
    const fileBuffer = await file.arrayBuffer();
    const fileName = generateFileName(file.name, `${folder}/`);

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: Buffer.from(fileBuffer),
      ContentType: file.type,
    });

    const result = await s3Client.send(command);

    // Use our API route for consistent file serving
    const publicUrl = `/api/files/${encodeURIComponent(fileName)}`;

    return {
      success: true,
      url: publicUrl,
      key: fileName,
      bucket: BUCKET_NAME,
      fileName: fileName,
      directS3Url: `https://${BUCKET_NAME}.s3.${
        process.env.AWS_REGION || "eu-north-1"
      }.amazonaws.com/${fileName}`,
    };
  } catch (error) {
    console.error("S3 Upload Error:", error);

    // If ACL error, try uploading without ACL and use signed URLs
    if (error.Code === "AccessControlListNotSupported") {
      return await uploadToS3WithoutACL(file, folder);
    }

    return {
      success: false,
      error: error.message,
    };
  }
};

// Alternative upload method without ACL (for buckets with ACLs disabled)
const uploadToS3WithoutACL = async (file, folder = "courses") => {
  try {
    const fileBuffer = await file.arrayBuffer();
    const fileName = generateFileName(file.name, `${folder}/`);

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: Buffer.from(fileBuffer),
      ContentType: file.type,
      // No ACL - bucket must have public access policy
    });

    const result = await s3Client.send(command);

    // For buckets without public access, use our file serving API
    const publicUrl = `/api/files/${encodeURIComponent(fileName)}`;

    return {
      success: true,
      url: publicUrl, // Use our API route instead of direct S3 URL
      key: fileName,
      bucket: BUCKET_NAME,
      fileName: fileName,
      directS3Url: `https://${BUCKET_NAME}.s3.${
        process.env.AWS_REGION || "eu-north-1"
      }.amazonaws.com/${fileName}`,
    };
  } catch (error) {
    console.error("S3 Upload Error (without ACL):", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Delete file from S3
export const deleteFromS3 = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);

    return {
      success: true,
      message: "File deleted successfully",
    };
  } catch (error) {
    console.error("S3 Delete Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Generate signed URL for secure access
export const generateSignedUrl = async (key, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });

    return {
      success: true,
      url: url,
    };
  } catch (error) {
    console.error("S3 Signed URL Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Upload multiple files
export const uploadMultipleToS3 = async (files, folder = "courses") => {
  try {
    const uploadPromises = files.map((file) => uploadToS3(file, folder));
    const results = await Promise.all(uploadPromises);

    return {
      success: true,
      files: results,
    };
  } catch (error) {
    console.error("S3 Multiple Upload Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get file info from S3
export const getFileInfo = async (key) => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const result = await s3Client.send(command);

    return {
      success: true,
      size: result.ContentLength,
      lastModified: result.LastModified,
      contentType: result.ContentType,
    };
  } catch (error) {
    console.error("S3 File Info Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

const awsService = {
  uploadToS3,
  deleteFromS3,
  generateSignedUrl,
  uploadMultipleToS3,
  getFileInfo,
};

export default awsService;

// Helper function to get the base URL for API calls
const getBaseUrl = () => {
  // Check if we're on the client side
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Server side - use environment variables or default
  return (
    process.env.FRONTEND_URL ||
    process.env.FRONTEND_URL ||
    process.env.NEXTAUTH_URL
  );
};

// Multipart Upload Functions for Large Files
export const initiateMultipartUpload = async (filename, contentType) => {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/upload/initiate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filename, contentType }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error initiating multipart upload:", error);
    return { success: false, error: error.message };
  }
};

export const getUploadPartUrls = async (uploadId, partNumbers, filename) => {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/upload/parts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uploadId, partNumbers, filename }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error getting upload part URLs:", error);
    return { success: false, error: error.message };
  }
};

export const completeMultipartUpload = async (uploadId, filename, parts) => {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/upload/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uploadId, filename, parts }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error completing multipart upload:", error);
    return { success: false, error: error.message };
  }
};

export const abortMultipartUpload = async (uploadId, filename) => {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/upload/abort`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uploadId, filename }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error aborting multipart upload:", error);
    return { success: false, error: error.message };
  }
};

// Large File Upload with Progress
export const uploadLargeFile = async (
  file,
  folder = "courses",
  onProgress = null
) => {
  try {
    const fileName = generateFileName(file.name, `${folder}/`);
    const chunkSize = 5 * 1024 * 1024; // 5MB chunks
    const totalChunks = Math.ceil(file.size / chunkSize);

    // Step 1: Initiate multipart upload
    const initResult = await initiateMultipartUpload(fileName, file.type);
    if (!initResult.success) {
      throw new Error(initResult.error);
    }

    const { uploadId } = initResult;
    const parts = [];

    try {
      // Step 2: Upload each part
      for (let i = 0; i < totalChunks; i++) {
        const partNumber = i + 1;
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        // Get presigned URL for this part
        const urlResult = await getUploadPartUrls(
          uploadId,
          [partNumber],
          fileName
        );
        if (!urlResult.success) {
          throw new Error(urlResult.error);
        }

        const uploadUrl = urlResult.presignedUrls[0];

        // Upload the chunk
        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: chunk,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload part ${partNumber}`);
        }

        const etag = uploadResponse.headers.get("ETag");
        parts.push({
          ETag: etag,
          PartNumber: partNumber,
        });

        // Report progress
        if (onProgress) {
          onProgress({
            loaded: end,
            total: file.size,
            percentage: Math.round((end / file.size) * 100),
            partNumber,
            totalParts: totalChunks,
          });
        }
      }

      // Step 3: Complete multipart upload
      const completeResult = await completeMultipartUpload(
        uploadId,
        fileName,
        parts
      );
      if (!completeResult.success) {
        throw new Error(completeResult.error);
      }

      return {
        success: true,
        url: completeResult.url,
        key: fileName,
        fileName: fileName,
      };
    } catch (error) {
      // Abort the multipart upload on error
      await abortMultipartUpload(uploadId, fileName);
      throw error;
    }
  } catch (error) {
    console.error("Large file upload error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
