import express from 'express';
import BookDonation from '../models/BookDonation.js';
import Book from '../models/Book.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Submit book donation
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      author,
      isbn,
      category,
      condition,
      publishedYear,
      description,
      estimatedValue
    } = req.body;

    const donation = new BookDonation({
      donorId: req.user.userId,
      title,
      author,
      isbn,
      category,
      condition,
      publishedYear,
      description,
      estimatedValue
    });

    await donation.save();

    res.status(201).json({
      message: 'Book donation submitted successfully',
      donation
    });
  } catch (error) {
    console.error('Donation submission error:', error);
    res.status(500).json({ message: 'Server error during donation submission' });
  }
});

// Get user's donations
router.get('/my-donations', auth, async (req, res) => {
  try {
    const donations = await BookDonation.find({ donorId: req.user.userId })
      .populate('reviewedBy', 'name')
      .populate('inventoryBookId', 'title')
      .sort({ createdAt: -1 });

    res.json({ donations });
  } catch (error) {
    console.error('Fetch donations error:', error);
    res.status(500).json({ message: 'Server error fetching donations' });
  }
});

// Get all donations (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const donations = await BookDonation.find(filter)
      .populate('donorId', 'name email studentId')
      .populate('reviewedBy', 'name')
      .populate('inventoryBookId', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await BookDonation.countDocuments(filter);

    res.json({
      donations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Fetch all donations error:', error);
    res.status(500).json({ message: 'Server error fetching donations' });
  }
});

// Review donation (admin only)
router.put('/:id/review', adminAuth, async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;
    
    const donation = await BookDonation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    donation.status = status;
    donation.reviewNotes = reviewNotes;
    donation.reviewedBy = req.user.userId;
    donation.reviewDate = new Date();

    await donation.save();

    res.json({
      message: 'Donation reviewed successfully',
      donation
    });
  } catch (error) {
    console.error('Donation review error:', error);
    res.status(500).json({ message: 'Server error during donation review' });
  }
});

// Add approved donation to inventory (admin only)
router.post('/:id/add-to-inventory', adminAuth, async (req, res) => {
  try {
    const donation = await BookDonation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.status !== 'approved') {
      return res.status(400).json({ message: 'Donation must be approved first' });
    }

    // Check if book already exists
    let book = await Book.findOne({ isbn: donation.isbn });
    
    if (book) {
      // Increase copy count
      book.totalCopies += 1;
      book.availableCopies += 1;
      await book.save();
    } else {
      // Create new book
      book = new Book({
        title: donation.title,
        author: donation.author,
        isbn: donation.isbn,
        category: donation.category,
        totalCopies: 1,
        availableCopies: 1,
        publishedYear: donation.publishedYear,
        description: donation.description
      });
      await book.save();
    }

    // Update donation
    donation.status = 'processed';
    donation.addedToInventory = true;
    donation.inventoryBookId = book._id;
    await donation.save();

    res.json({
      message: 'Donation added to inventory successfully',
      book,
      donation
    });
  } catch (error) {
    console.error('Add to inventory error:', error);
    res.status(500).json({ message: 'Server error adding donation to inventory' });
  }
});

export default router;