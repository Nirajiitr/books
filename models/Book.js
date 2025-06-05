import mongoose from "mongoose";
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  
  publishedDate: {
    type: Date,
    required: true,
  },
  pageCount: {
    type: Number,
    required: true, 
  },
    coverImage: {
        type: String,
        default: "https://example.com/default-cover.png", 
    },
    ratings: {
        type: Number,
        min: 0, 
        max: 5, 
        required: true,
        default: 0, 
    },
  
}, {
  timestamps: true,
  }
);
const Book = mongoose.model("Book", bookSchema);
export default Book;