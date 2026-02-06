import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

// Initialize Firebase Admin (assumes GOOGLE_APPLICATION_CREDENTIALS env var is set)
const storage = admin.storage();
const bucket = storage.bucket(process.env.FIREBASE_STORAGE_BUCKET || '');

const MAX_IMAGES_PER_USER = 10;

/**
 * Upload a profile image to Firebase Storage
 * @param userId - User's unique ID (used as folder name)
 * @param file - File buffer and metadata
 * @returns URL of uploaded image
 */
export async function uploadProfileImage(
  userId: string,
  file: { buffer: Buffer; mimetype: string; originalname: string }
): Promise<{ url: string; path: string }> {
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
  const path = `profile-images/${userId}/${filename}`;

  // Create file reference
  const fileRef = bucket.file(path);

  // Upload to Firebase Storage
  await fileRef.save(file.buffer, {
    metadata: {
      contentType: file.mimetype,
      cacheControl: 'public, max-age=31536000', // Cache for 1 year
      metadata: {
        uploadedBy: userId,
        uploadedAt: new Date().toISOString(),
      },
    },
  });

  // Generate signed URL (valid for 1 year)
  const [signedUrl] = await fileRef.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
  });

  console.log(`✅ Uploaded profile image for user ${userId}: ${path}`);

  return { url: signedUrl, path };
}

/**
 * Delete a profile image from Firebase Storage
 * @param path - Firebase Storage file path (e.g., "profile-images/uid123/profile-123456789.jpg")
 */
export async function deleteProfileImage(path: string): Promise<void> {
  const fileRef = bucket.file(path);
  await fileRef.delete();
  console.log(`🗑️  Deleted profile image: ${path}`);
}

/**
 * List all images for a user
 * @param userId - User's unique ID
 * @returns Array of image URLs
 */
export async function listUserImages(userId: string): Promise<string[]> {
  const prefix = `profile-images/${userId}/`;

  try {
    const [files] = await bucket.getFiles({ prefix });

    const urls = await Promise.all(
      files.map(async (file) => {
        const [signedUrl] = await file.getSignedUrl({
          version: 'v4',
          action: 'read',
          expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
        });
        return signedUrl;
      })
    );

    return urls;
  } catch (error) {
    console.error('Error listing user images:', error);
    return [];
  }
}

/**
 * Get a signed URL for an existing image
 * @param path - Firebase Storage file path
 * @returns Signed URL
 */
export async function getSignedUrl(path: string): Promise<string> {
  const fileRef = bucket.file(path);
  const [signedUrl] = await fileRef.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
  });
  return signedUrl;
}

/**
 * Delete all images for a user (when account is deleted)
 * @param userId - User's unique ID
 */
export async function deleteUserImages(userId: string): Promise<void> {
  const prefix = `profile-images/${userId}/`;

  try {
    const [files] = await bucket.getFiles({ prefix });
    await Promise.all(files.map((file) => file.delete()));
    console.log(`🗑️  Deleted all images for user ${userId}`);
  } catch (error) {
    console.error('Error deleting user images:', error);
  }
}
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
