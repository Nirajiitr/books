import express from 'express';
import multer from 'multer';
import cloudinary from '../lib/cloudinary.js';
import authenticated from '../middleware/authenticated.js';

const router = express.Router();

// Multer memory storage to upload file to Cloudinary directly
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  '/',
  authenticated,
  upload.single('file'), // 'file' is the field name sent from client
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Convert buffer to base64
      const base64String = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

      // Upload to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(base64String, {
        folder: 'books',
      });

      return res.status(200).json({ imageUrl: uploadResult.secure_url });
    } catch (error) {
      console.error('Cloudinary Upload Error:', error);
      return res.status(500).json({ message: 'Image upload failed' });
    }
  }
);

export default router;
