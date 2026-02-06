import { Router, Response } from 'express';
import { uploadSingleImage, uploadMultipleImages } from '../middleware/upload';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import {
  uploadProfileImage,
  deleteProfileImage,
  listUserImages,
  deleteUserImages,
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

      if (!req.user?.uid) {
        return res.status(401).json({ error: 'User ID not found' });
      }

      // Upload to Firebase Storage with user ID as folder name
      const result = await uploadProfileImage(req.user.uid, {
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        originalname: req.file.originalname,
      });

      // TODO: Save image URL to database (user_images table)
      // await query('INSERT INTO user_images (user_id, image_url, storage_path) VALUES ($1, $2, $3)', 
      //   [req.user.uid, result.url, result.path]);

      res.status(201).json({
        message: 'Profile image uploaded successfully',
        imageUrl: result.url,
        path: result.path,
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

      if (!req.user?.uid) {
        return res.status(401).json({ error: 'User ID not found' });
      }

      const uploadResults = [];

      // Upload each file
      for (const file of req.files) {
        const result = await uploadProfileImage(req.user.uid, {
          buffer: file.buffer,
          mimetype: file.mimetype,
          originalname: file.originalname,
        });

        uploadResults.push(result);

        // TODO: Save to database
        // await query('INSERT INTO user_images (user_id, image_url, storage_path) VALUES ($1, $2, $3)', 
        //   [req.user.uid, result.url, result.path]);
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
      if (!req.user?.uid) {
        return res.status(401).json({ error: 'User ID not found' });
      }

      const images = await listUserImages(req.user.uid);

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
 * DELETE /api/profile/images/:path(*)
 * Delete a specific profile image
 * Requires authentication
 */
router.delete(
  '/:path(*)',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const path = req.params.path;

      if (!path) {
        return res.status(400).json({ error: 'Image path is required' });
      }

      if (!req.user?.uid) {
        return res.status(401).json({ error: 'User ID not found' });
      }

      // Verify the path belongs to the user
      if (!path.startsWith(`profile-images/${req.user.uid}/`)) {
        return res.status(403).json({ error: 'Unauthorized to delete this image' });
      }

      await deleteProfileImage(path);

      // TODO: Delete from database
      // await query('DELETE FROM user_images WHERE user_id = $1 AND storage_path = $2', 
      //   [req.user.uid, path]);

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
      if (!req.user?.uid) {
        return res.status(401).json({ error: 'User ID not found' });
      }

      await deleteUserImages(req.user.uid);

      // TODO: Delete from database
      // await query('DELETE FROM user_images WHERE user_id = $1', [req.user.uid]);

      res.json({ message: 'All profile images deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting all images:', error);
      res.status(500).json({ error: 'Failed to delete images' });
    }
  }
);

export default router;
