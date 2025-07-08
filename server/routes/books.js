import express from 'express';
import Book from '../models/Book.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all books with search and filtering
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      author,
      page = 1,
      limit = 12,
      sortBy = 'title',
      sortOrder = 'asc'
    } = req.query;

    // Build filter object
    const filter = { status: 'active' };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (author) {
      filter.author = { $regex: author, $options: 'i' };
    }

    // Build search query
    let query = Book.find(filter);
    
    if (search) {
      query = Book.find({
        ...filter,
        $text: { $search: search }
      });
    }

    // Apply sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const books = await query
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Book.countDocuments(search ? 
      { ...filter, $text: { $search: search } } : 
      filter
    );

    res.json({
      books,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Fetch books error:', error);
    res.status(500).json({ message: 'Server error fetching books' });
  }
});

// Get book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({ book });
  } catch (error) {
    console.error('Fetch book error:', error);
    res.status(500).json({ message: 'Server error fetching book' });
  }
});

// Add new book (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const bookData = req.body;
    
    // Check if book with same ISBN already exists
    const existingBook = await Book.findOne({ isbn: bookData.isbn });
    if (existingBook) {
      return res.status(400).json({ message: 'Book with this ISBN already exists' });
    }

    const book = new Book(bookData);
    await book.save();

    res.status(201).json({
      message: 'Book added successfully',
      book
    });
  } catch (error) {
    console.error('Add book error:', error);
    res.status(500).json({ message: 'Server error adding book' });
  }
});

// Update book (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({
      message: 'Book updated successfully',
      book
    });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({ message: 'Server error updating book' });
  }
});

// Delete book (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ message: 'Server error deleting book' });
  }
});

export default router;