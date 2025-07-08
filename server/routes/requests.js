import express from 'express';
import BookRequest from '../models/BookRequest.js';
import Book from '../models/Book.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Submit book request
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      author,
      isbn,
      category,
      publishedYear,
      publisher,
      reason,
      priority,
      estimatedCost
    } = req.body;

    // Check if similar request already exists
    const existingRequest = await BookRequest.findOne({
      title: { $regex: new RegExp(title, 'i') },
      author: { $regex: new RegExp(author, 'i') },
      status: { $in: ['pending', 'under_review', 'approved', 'ordered'] }
    });

    if (existingRequest) {
      return res.status(400).json({ 
        message: 'A similar book request already exists',
        existingRequest 
      });
    }

    const request = new BookRequest({
      requesterId: req.user.userId,
      title,
      author,
      isbn,
      category,
      publishedYear,
      publisher,
      reason,
      priority,
      estimatedCost
    });

    await request.save();

    res.status(201).json({
      message: 'Book request submitted successfully',
      request
    });
  } catch (error) {
    console.error('Book request submission error:', error);
    res.status(500).json({ message: 'Server error during book request submission' });
  }
});

// Get user's book requests
router.get('/my-requests', auth, async (req, res) => {
  try {
    const requests = await BookRequest.find({ requesterId: req.user.userId })
      .populate('reviewedBy', 'name')
      .populate('inventoryBookId', 'title')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    console.error('Fetch requests error:', error);
    res.status(500).json({ message: 'Server error fetching requests' });
  }
});

// Support a book request
router.post('/:id/support', auth, async (req, res) => {
  try {
    const request = await BookRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Book request not found' });
    }

    // Check if user already supported this request
    const alreadySupported = request.supportingUsers.some(
      support => support.userId.toString() === req.user.userId
    );

    if (alreadySupported) {
      return res.status(400).json({ message: 'You have already supported this request' });
    }

    request.supportingUsers.push({
      userId: req.user.userId,
      supportDate: new Date()
    });

    await request.save();

    res.json({
      message: 'Request supported successfully',
      supportCount: request.supportingUsers.length
    });
  } catch (error) {
    console.error('Support request error:', error);
    res.status(500).json({ message: 'Server error supporting request' });
  }
});

// Get all book requests (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const requests = await BookRequest.find(filter)
      .populate('requesterId', 'name email studentId')
      .populate('reviewedBy', 'name')
      .populate('supportingUsers.userId', 'name')
      .populate('inventoryBookId', 'title')
      .sort({ 
        priority: { urgent: 1, high: 2, medium: 3, low: 4 },
        createdAt: -1 
      })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await BookRequest.countDocuments(filter);

    res.json({
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Fetch all requests error:', error);
    res.status(500).json({ message: 'Server error fetching requests' });
  }
});

// Review book request (admin only)
router.put('/:id/review', adminAuth, async (req, res) => {
  try {
    const { status, reviewNotes, orderDate, expectedDelivery } = req.body;
    
    const request = await BookRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Book request not found' });
    }

    request.status = status;
    request.reviewNotes = reviewNotes;
    request.reviewedBy = req.user.userId;
    request.reviewDate = new Date();

    if (orderDate) request.orderDate = new Date(orderDate);
    if (expectedDelivery) request.expectedDelivery = new Date(expectedDelivery);

    await request.save();

    res.json({
      message: 'Book request reviewed successfully',
      request
    });
  } catch (error) {
    console.error('Request review error:', error);
    res.status(500).json({ message: 'Server error during request review' });
  }
});

// Mark book as received and add to inventory (admin only)
router.post('/:id/received', adminAuth, async (req, res) => {
  try {
    const { totalCopies = 1 } = req.body;
    
    const request = await BookRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Book request not found' });
    }

    if (request.status !== 'ordered') {
      return res.status(400).json({ message: 'Book must be in ordered status' });
    }

    // Check if book already exists
    let book = await Book.findOne({ isbn: request.isbn });
    
    if (book) {
      // Increase copy count
      book.totalCopies += totalCopies;
      book.availableCopies += totalCopies;
      await book.save();
    } else {
      // Create new book
      book = new Book({
        title: request.title,
        author: request.author,
        isbn: request.isbn,
        category: request.category,
        totalCopies,
        availableCopies: totalCopies,
        publishedYear: request.publishedYear,
        publisher: request.publisher
      });
      await book.save();
    }

    // Update request
    request.status = 'received';
    request.receivedDate = new Date();
    request.addedToInventory = true;
    request.inventoryBookId = book._id;
    await request.save();

    res.json({
      message: 'Book received and added to inventory successfully',
      book,
      request
    });
  } catch (error) {
    console.error('Mark received error:', error);
    res.status(500).json({ message: 'Server error marking book as received' });
  }
});

export default router;