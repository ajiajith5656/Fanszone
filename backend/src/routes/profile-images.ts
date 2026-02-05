import { Router, Response } from 'express';
import { uploadSingleImage, uploadMultipleImages } from '../middleware/upload';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import {
  uploadProfileImage,
  deleteProfileImage,
  listUserImages,
  deleteAllUserImages,
} from '../services/s3.service';

const router = Router();

/**
 * POST /api/profile/images/upload
 * Upload a single profile image
 * Requires authentication
 */
router.post(
  '/upload',
  authenticateToken,
  uploadSingleImage,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      if (!req.user?.sub) {
        return res.status(401).json({ error: 'User ID not found' });
      }

      // Upload to S3 with user ID as folder name
      const result = await uploadProfileImage(req.user.sub, {
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        originalname: req.file.originalname,
      });

      // TODO: Save image URL to database (user_images table)
      // await query('INSERT INTO user_images (user_id, image_url, s3_key) VALUES ($1, $2, $3)', 
      //   [req.user.sub, result.url, result.key]);

      res.status(201).json({
        message: 'Profile image uploaded successfully',
        imageUrl: result.url,
        key: result.key,
      });
    } catch (error: any) {
      console.error('Error uploading profile image:', error);
      res.status(500).json({ error: error.message || 'Failed to upload image' });
    }
  }
);

/**
 * POST /api/profile/images/upload-multiple
 * Upload multiple profile images (up to 10)
 * Requires authentication
 */
router.post(
  '/upload-multiple',
  authenticateToken,
  uploadMultipleImages,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      if (!req.user?.sub) {
        return res.status(401).json({ error: 'User ID not found' });
      }

      const uploadResults = [];

      // Upload each file
      for (const file of req.files) {
        const result = await uploadProfileImage(req.user.sub, {
          buffer: file.buffer,
          mimetype: file.mimetype,
          originalname: file.originalname,
        });

        uploadResults.push(result);

        // TODO: Save to database
        // await query('INSERT INTO user_images (user_id, image_url, s3_key) VALUES ($1, $2, $3)', 
        //   [req.user.sub, result.url, result.key]);
      }

      res.status(201).json({
        message: `${uploadResults.length} profile images uploaded successfully`,
        images: uploadResults,
      });
    } catch (error: any) {
      console.error('Error uploading multiple images:', error);
      res.status(500).json({ error: error.message || 'Failed to upload images' });
    }
  }
);

/**
 * GET /api/profile/images
 * Get all profile images for the authenticated user
 * Requires authentication
 */
router.get(
  '/',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user?.sub) {
        return res.status(401).json({ error: 'User ID not found' });
      }

      const images = await listUserImages(req.user.sub);

      res.json({
        images,
        count: images.length,
      });
    } catch (error: any) {
      console.error('Error fetching profile images:', error);
      res.status(500).json({ error: 'Failed to fetch images' });
    }
  }
);

/**
 * DELETE /api/profile/images/:key
 * Delete a specific profile image
 * Requires authentication
 */
router.delete(
  '/:key(*)',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const key = req.params.key;

      if (!key) {
        return res.status(400).json({ error: 'Image key is required' });
      }

      if (!req.user?.sub) {
        return res.status(401).json({ error: 'User ID not found' });
      }

      // Verify the key belongs to the user
      if (!key.startsWith(`${req.user.sub}/`)) {
        return res.status(403).json({ error: 'Unauthorized to delete this image' });
      }

      await deleteProfileImage(key);

      // TODO: Delete from database
      // await query('DELETE FROM user_images WHERE user_id = $1 AND s3_key = $2', 
      //   [req.user.sub, key]);

      res.json({ message: 'Image deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting profile image:', error);
      res.status(500).json({ error: 'Failed to delete image' });
    }
  }
);

/**
 * DELETE /api/profile/images
 * Delete all profile images for the authenticated user
 * Requires authentication
 */
router.delete(
  '/',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user?.sub) {
        return res.status(401).json({ error: 'User ID not found' });
      }

      await deleteAllUserImages(req.user.sub);

      // TODO: Delete from database
      // await query('DELETE FROM user_images WHERE user_id = $1', [req.user.sub]);

      res.json({ message: 'All profile images deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting all images:', error);
      res.status(500).json({ error: 'Failed to delete images' });
    }
  }
);

export default router;
