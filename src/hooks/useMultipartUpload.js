import { useState, useCallback } from 'react';

export const useMultipartUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadLargeFile = useCallback(async (file, folder = 'lesson-videos') => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Step 1: Get presigned URLs for multipart upload
      const initResponse = await fetch('/api/upload/presigned-multipart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          fileType: file.type,
          fileSize: file.size,
          folder,
        }),
      });

      if (!initResponse.ok) {
        throw new Error('Failed to initialize multipart upload');
      }

      const { uploadId, key, presignedUrls, chunkSize } = await initResponse.json();

      // Step 2: Upload each part
      const uploadedParts = [];
      const totalParts = presignedUrls.length;

      for (let i = 0; i < totalParts; i++) {
        const { partNumber, url } = presignedUrls[i];
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const uploadResponse = await fetch(url, {
          method: 'PUT',
          body: chunk,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload part ${partNumber}`);
        }

        const etag = uploadResponse.headers.get('ETag');
        uploadedParts.push({
          ETag: etag,
          PartNumber: partNumber,
        });

        // Update progress
        const progress = Math.round(((i + 1) / totalParts) * 100);
        setUploadProgress(progress);
      }

      // Step 3: Complete multipart upload
      const completeResponse = await fetch('/api/upload/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uploadId,
          filename: key,
          parts: uploadedParts,
        }),
      });

      if (!completeResponse.ok) {
        throw new Error('Failed to complete multipart upload');
      }

      const result = await completeResponse.json();
      
      return {
        success: true,
        url: `/api/files/${encodeURIComponent(key)}`,
        key,
        fileName: key,
      };

    } catch (err) {
      setError(err.message);
      
      // Try to abort the upload if we have an uploadId
      if (uploadId) {
        try {
          await fetch('/api/upload/abort', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uploadId,
              filename: key,
            }),
          });
        } catch (abortError) {
          console.error('Failed to abort upload:', abortError);
        }
      }
      
      return {
        success: false,
        error: err.message,
      };
    } finally {
      setIsUploading(false);
    }
  }, []);

  const resetUpload = useCallback(() => {
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
  }, []);

  return {
    uploadLargeFile,
    isUploading,
    uploadProgress,
    error,
    resetUpload,
  };
};