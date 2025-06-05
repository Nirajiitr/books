import express from "express";
import Book from "../models/Book.js";
import mongoose from "mongoose";
import cloudinary from "../lib/cloudinary.js";

import authenticated from "../middleware/authenticated.js";

const router = express.Router();

router.post("/", authenticated, async (req, res) => {
  const { title, description, publishedDate, pageCount, coverImage, ratings, author } =
    req.body;

  try {
    if (!title || !description || !publishedDate || !pageCount || !ratings || !coverImage || !author) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newBook = new Book({
      title,
      author,
      description,
      user: req.user._id,
      publishedDate,
      pageCount,
      coverImage,
      ratings,
    });

    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (error) {
    console.error("Error creating book:", error);
    res
      .status(500)
      .json({ message: "Error creating book", error: error.message });
  }
});
router.get("/", authenticated, async (req, res) => {
  const { page = 1, limit = 5 } = req.query;
  const skip = (page - 1) * limit;

  try {
    const books = await Book.find()
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .populate("user", "username profilePicture"); 
    if (books.length === 0) {
      return res.status(404).json({ message: "No books found" });
    }

    res.status(200).json({
      books,
      currentPage: Number(page),
      totalBooks: await Book.countDocuments(),
      totalPages: Math.ceil((await Book.countDocuments()) / limit),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching books", error: error.message });
  }
});
// delete book by id
function extractPublicId(secureUrl) {
  const url = new URL(secureUrl);
  const parts = url.pathname.split('/');
  const uploadIndex = parts.indexOf('upload');
  if (uploadIndex === -1) return null;

  const rest = parts.slice(uploadIndex + 1);
  const filtered = rest.filter(p => !/^v\d+$/.test(p) && !p.includes(','));
  const folderAndFilename = filtered.join('/'); 

  return folderAndFilename.replace(/\.[^/.]+$/, ""); 
}

router.delete("/:id", authenticated, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid book ID" });
  }

  try {
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this book" });
      }

   if (book.coverImage) {
  const publicId = extractPublicId(book.coverImage);
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn("Failed to delete Cloudinary image:", err.message);
  }
}


    await Book.findByIdAndDelete(id);
    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Error deleting book:", error); 
    res
      .status(500)
      .json({ message: "Error deleting book", error: error.message });
  }
});

// get recommended books by user
router.get("/user/recommended", authenticated, async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);
      

    if (books.length === 0) {
      return res.status(404).json({ message: "No recommended books found" });
    }

    res.status(200).json(books);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching recommended books",
        error: error.message,
      });
  }
});
export default router;
