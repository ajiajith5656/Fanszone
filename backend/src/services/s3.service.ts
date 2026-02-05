import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
});

const PROFILE_BUCKET = 'mallucupiddp';
const MAX_IMAGES_PER_USER = 10;

/**
 * Upload a profile image to S3
 * @param userId - User's unique ID (used as folder name)
 * @param file - File buffer and metadata
 * @returns URL of uploaded image
 */
export async function uploadProfileImage(
  userId: string,
  file: { buffer: Buffer; mimetype: string; originalname: string }
): Promise<{ url: string; key: string }> {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
  }

  // Validate file size (max 5MB)
  if (file.buffer.length > 5 * 1024 * 1024) {
    throw new Error('File size exceeds 5MB limit.');
  }

  // Check if user already has max images
  const existingImages = await listUserImages(userId);
  if (existingImages.length >= MAX_IMAGES_PER_USER) {
    throw new Error(`Maximum ${MAX_IMAGES_PER_USER} profile images allowed.`);
  }

  // Generate unique filename with timestamp
  const timestamp = Date.now();
  const extension = file.mimetype.split('/')[1];
  const filename = `profile-${timestamp}.${extension}`;
  const key = `${userId}/${filename}`;

  // Upload to S3
  const command = new PutObjectCommand({
    Bucket: PROFILE_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    CacheControl: 'max-age=31536000', // Cache for 1 year
  });

  await s3Client.send(command);

  const url = `https://${PROFILE_BUCKET}.s3.amazonaws.com/${key}`;
  console.log(`✅ Uploaded profile image for user ${userId}: ${url}`);

  return { url, key };
}

/**
 * Delete a profile image from S3
 * @param key - S3 object key (e.g., "uid123/profile-123456789.jpg")
 */
export async function deleteProfileImage(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: PROFILE_BUCKET,
    Key: key,
  });

  await s3Client.send(command);
  console.log(`🗑️  Deleted profile image: ${key}`);
}

/**
 * List all images for a user
 * @param userId - User's unique ID
 * @returns Array of image URLs
 */
export async function listUserImages(userId: string): Promise<string[]> {
  const command = new ListObjectsV2Command({
    Bucket: PROFILE_BUCKET,
    Prefix: `${userId}/`,
  });

  const response = await s3Client.send(command);
  const images = response.Contents?.map(
    (obj) => `https://${PROFILE_BUCKET}.s3.amazonaws.com/${obj.Key}`
  ) || [];

  return images;
}

/**
 * Create user folder (automatically created on first upload, but this ensures it exists)
 * @param userId - User's unique ID
 */
export async function ensureUserFolder(userId: string): Promise<void> {
  // S3 doesn't have "folders" - they're created implicitly when uploading files
  // This function is a placeholder for future folder-level operations
  console.log(`📁 User folder will be created on first upload: ${userId}/`);
}

/**
 * Delete all images for a user
 * @param userId - User's unique ID
 */
export async function deleteAllUserImages(userId: string): Promise<void> {
  const images = await listUserImages(userId);
  
  for (const imageUrl of images) {
    const key = imageUrl.split('.com/')[1]; // Extract key from URL
    await deleteProfileImage(key);
  }

  console.log(`🗑️  Deleted all ${images.length} images for user ${userId}`);
}
