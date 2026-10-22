import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_UPLOADS_DIR = path.resolve(__dirname, '../uploads/exam_recordings');

// Ensure local uploads directory exists
if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
  fs.mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true });
}

/**
 * Returns whether AWS S3 credentials are configured in environment
 */
export function isS3Configured() {
  const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET } = process.env;
  return Boolean(
    AWS_ACCESS_KEY_ID &&
    AWS_SECRET_ACCESS_KEY &&
    AWS_REGION &&
    AWS_S3_BUCKET &&
    !AWS_ACCESS_KEY_ID.includes('placeholder') &&
    !AWS_ACCESS_KEY_ID.includes('your_')
  );
}

/**
 * Creates S3 Client instance if credentials are valid
 */
export function getS3Client() {
  if (!isS3Configured()) return null;

  return new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

/**
 * Generates an S3 Pre-Signed Upload URL (PUT) for direct browser-to-cloud upload
 * @param {string} fileName - Destination filename
 * @param {string} contentType - Media MIME type (e.g. 'video/webm')
 * @returns {Promise<{ uploadUrl: string, fileUrl: string, key: string, useS3: boolean }>}
 */
export async function generatePresignedUploadUrl(fileName, contentType = 'video/webm') {
  if (isS3Configured()) {
    try {
      const s3 = getS3Client();
      const bucket = process.env.AWS_S3_BUCKET;
      const key = `exam_recordings/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
      });

      // URL valid for 15 minutes (900 seconds)
      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });
      const region = process.env.AWS_REGION || 'ap-south-1';
      const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

      return {
        useS3: true,
        uploadUrl,
        fileUrl,
        key,
      };
    } catch (err) {
      console.warn('[CloudStorage Warning] S3 presigned URL generation failed:', err.message);
    }
  }

  // Fallback: direct server-hosted endpoint
  return {
    useS3: false,
    uploadUrl: '/api/exam/upload-recording',
    fileUrl: '',
    key: '',
  };
}

/**
 * Deletes an exam recording file either from AWS S3 or local disk.
 * @param {string} recordingUrl - Recording URL or path
 * @returns {Promise<{ success: boolean, storage: 's3'|'local'|'none', error?: string }>}
 */
export async function deleteRecordingFile(recordingUrl) {
  if (!recordingUrl || typeof recordingUrl !== 'string') {
    return { success: false, storage: 'none', error: 'No recording URL provided' };
  }

  // Handle S3 URLs
  if (recordingUrl.includes('.amazonaws.com/') || recordingUrl.startsWith('s3://')) {
    if (isS3Configured()) {
      try {
        const s3 = getS3Client();
        const bucket = process.env.AWS_S3_BUCKET;
        let key = '';
        if (recordingUrl.startsWith('s3://')) {
          key = recordingUrl.replace(/^s3:\/\/[^/]+\//, '');
        } else {
          const urlObj = new URL(recordingUrl);
          key = urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;
        }

        await s3.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
          })
        );
        return { success: true, storage: 's3' };
      } catch (err) {
        return { success: false, storage: 's3', error: err.message };
      }
    }
  }

  // Handle local filesystem uploads
  try {
    const filename = path.basename(recordingUrl);
    const localPath = path.resolve(LOCAL_UPLOADS_DIR, filename);

    if (fs.existsSync(localPath)) {
      await fs.promises.unlink(localPath);
      return { success: true, storage: 'local' };
    }
    return { success: true, storage: 'local', note: 'File already absent' };
  } catch (err) {
    return { success: false, storage: 'local', error: err.message };
  }
}

export { LOCAL_UPLOADS_DIR };
