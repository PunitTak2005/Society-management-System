import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import crypto from 'crypto';

// S3Client automatically retrieves credentials from the EC2 IAM Instance Profile
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

/**
 * Uploads a file buffer to S3
 * @param {Buffer} fileBuffer - The file buffer from multer
 * @param {string} originalName - Original filename
 * @param {string} mimeType - MIME type of the file (e.g. image/jpeg)
 * @returns {Promise<string>} - Public S3 URL of the uploaded image
 */
export const uploadToS3 = async (fileBuffer, originalName, mimeType) => {
  if (!BUCKET_NAME) {
    throw new Error('AWS_S3_BUCKET_NAME is not defined in environment variables.');
  }

  const ext = path.extname(originalName) || '.jpg';
  const fileHash = crypto.randomBytes(16).toString('hex');
  const key = `profiles/${Date.now()}-${fileHash}${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await s3Client.send(command);

  // Return standard S3 Virtual-Hosted URL
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
};

/**
 * Deletes an object from S3 using its key or full URL
 * @param {string} fileUrlOrKey - S3 full URL or object key
 */
export const deleteFromS3 = async (fileUrlOrKey) => {
  if (!fileUrlOrKey || !BUCKET_NAME) return;

  let key = fileUrlOrKey;
  if (fileUrlOrKey.startsWith('http')) {
    const url = new URL(fileUrlOrKey);
    key = url.pathname.replace(/^\//, '');
  }

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
};