import { useState, useCallback } from 'react';
import { uploadToS3, uploadLargeFile } from '@/lib/services/awsService';
import toast from 'react-hot-toast';

export function useFileUpload() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const uploadFile = useCallback(async (file, folder = 'courses', useMultipart = false) => {
    if (!file) {
      toast.error('No file selected');
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadedFile(null);

    try {
      let result;
      
      // Use multipart upload for files larger than 10MB or if explicitly requested
      if (file.size > 10 * 1024 * 1024 || useMultipart) {
        toast.loading('Uploading large file...', { id: 'upload-toast' });
        
        result = await uploadLargeFile(file, folder, (progress) => {
          setUploadProgress(progress.percentage);
          toast.loading(
            `Uploading... ${progress.percentage}% (Part ${progress.partNumber}/${progress.totalParts})`,
            { id: 'upload-toast' }
          );
        });
      } else {
        toast.loading('Uploading file...', { id: 'upload-toast' });
        result = await uploadToS3(file, folder);
        setUploadProgress(100);
      }

      if (result.success) {
        setUploadedFile({
          url: result.url,
          key: result.key,
          fileName: result.fileName || file.name,
          size: file.size,
          type: file.type
        });
        toast.success('File uploaded successfully!', { id: 'upload-toast' });
        return result;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message}`, { id: 'upload-toast' });
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const resetUpload = useCallback(() => {
    setUploadProgress(0);
    setIsUploading(false);
    setUploadedFile(null);
  }, []);

  return {
    uploadFile,
    uploadProgress,
    isUploading,
    uploadedFile,
    resetUpload
  };
}

export default useFileUpload;