import express from 'express';
import Book from '../models/Book.js';

import authenticated from '../middleware/authenticated.js';


const router = express.Router();

router.post('/', authenticated, async (req, res) => {
    const { title, description, publishedDate, pageCount, coverImage, ratings } = req.body;
      
    try {
       
        let coverImageUrl = coverImage;
        if (coverImage) {
        const uploadResponse = await cloudinary.uploader.upload(coverImage, {
            folder: 'bookworm/covers',
        });
        coverImageUrl = uploadResponse.secure_url;
        }
        
        const newBook = new Book({
        title,
        author: req.user.username, 
        description,
        user : req.user._id, 
        publishedDate,
        pageCount,
        coverImage: coverImageUrl,
        ratings,
        });

        const savedBook = await newBook.save();
        res.status(201).json(savedBook);
    } catch (error) {
        res.status(500).json({ message: 'Error creating book', error: error.message });
    }
})
// get 5 books by 5 books as scrolling
router.get('/', authenticated, async (req, res) => {
    const { page = 1, limit = 5 } = req.query;
    const skip = (page - 1) * limit;

    try {
        const books = await Book.find()
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 })
            .populate('user', 'username profilePicture'); // Populate user details
        if (books.length === 0) {
            return res.status(404).json({ message: 'No books found' });
        }

        res.status(200).json({
            books,
            currentPage: Number(page),
            totalBooks: await Book.countDocuments(),
            totalPages: Math.ceil(await Book.countDocuments() / limit),
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books', error: error.message });
    } 
})
// delete book by id
router.delete('/:id', authenticated, async (req, res) => {
    const { id } = req.params;

    try {
        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (book.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to delete this book' });
        }
        // delete cover image from cloudinary
        if (book.coverImage) {
            const publicId = book.coverImage.split('/').pop().split('.')[0]; // Extract public ID from URL
            await cloudinary.uploader.destroy(`bookworm/covers/${publicId}`);
        }
        
        await Book.findByIdAndDelete(id);
        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting book', error: error.message });
    }
});
// update book by id
router.put('/:id', authenticated, async (req, res) => {
    const { id } = req.params;
    const { title, author, description, publishedDate, pageCount, coverImage, ratings } = req.body;

    try {
        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (book.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to update this book' });
        }

        let coverImageUrl = book.coverImage;
        if (coverImage) {
            const uploadResponse = await cloudinary.uploader.upload(coverImage, {
                folder: 'bookworm/covers',
            });
            coverImageUrl = uploadResponse.secure_url;
        }

        book.title = title || book.title;
        book.author = author || book.author;
        book.description = description || book.description;
        book.publishedDate = publishedDate || book.publishedDate;
        book.pageCount = pageCount || book.pageCount;
        book.coverImage = coverImageUrl;
        book.ratings = ratings || book.ratings;

        const updatedBook = await book.save();
        res.status(200).json(updatedBook);
    } catch (error) {
        res.status(500).json({ message: 'Error updating book', error: error.message });
    }
});
// get recommended books by user 
router.get('/recommended', authenticated, async (req, res) => {
    try {
        const books = await Book.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'username profilePicture'); // Populate user details

        if (books.length === 0) {
            return res.status(404).json({ message: 'No recommended books found' });
        }

        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching recommended books', error: error.message });
    }
});
export default router;