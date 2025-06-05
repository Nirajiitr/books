import express from 'express';
import multer from 'multer';
import cloudinary from '../lib/cloudinary.js';
import authenticated from '../middleware/authenticated.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  '/',
  authenticated,
  upload.single('file'), 
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const base64String = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

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
