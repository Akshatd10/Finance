import express from 'express';
import Transaction from '../models/Transaction.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Get transactions
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    
    // If not admin, only show user's transactions
    if (req.user.role !== 'admin') {
      filter.memberId = req.user.userId;
    }
    
    if (status) filter.status = status;

    const transactions = await Transaction.find(filter)
      .populate('bookId', 'title author isbn')
      .populate('memberId', 'name email studentId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Fetch transactions error:', error);
    res.status(500).json({ message: 'Server error fetching transactions' });
  }
});

// Issue book (admin only)
router.post('/issue', adminAuth, async (req, res) => {
  try {
    const { bookId, memberId } = req.body;

    // Check if book exists and is available
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: 'Book is not available' });
    }

    // Check if member exists and is active
    const member = await User.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    if (member.status !== 'active') {
      return res.status(400).json({ message: 'Member account is not active' });
    }

    // Calculate due date (14 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    // Create transaction
    const transaction = new Transaction({
      bookId,
      memberId,
      type: 'issue',
      dueDate,
      issuedBy: req.user.userId
    });

    await transaction.save();

    // Update book availability
    book.availableCopies -= 1;
    book.popularity.borrowCount += 1;
    await book.save();

    // Update member statistics
    member.currentBorrowed += 1;
    member.totalBorrowed += 1;
    await member.save();

    res.status(201).json({
      message: 'Book issued successfully',
      transaction
    });
  } catch (error) {
    console.error('Issue book error:', error);
    res.status(500).json({ message: 'Server error issuing book' });
  }
});

// Return book
router.put('/:id/return', adminAuth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('bookId')
      .populate('memberId');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.status !== 'active') {
      return res.status(400).json({ message: 'Book is already returned' });
    }

    // Calculate fine if overdue
    const returnDate = new Date();
    let fine = 0;
    
    if (returnDate > transaction.dueDate) {
      const daysOverdue = Math.ceil((returnDate - transaction.dueDate) / (1000 * 60 * 60 * 24));
      fine = daysOverdue * 0.50; // $0.50 per day
    }

    // Update transaction
    transaction.returnDate = returnDate;
    transaction.fine = fine;
    transaction.status = 'returned';
    transaction.returnedBy = req.user.userId;
    await transaction.save();

    // Update book availability
    const book = await Book.findById(transaction.bookId._id);
    book.availableCopies += 1;
    await book.save();

    // Update member statistics
    const member = await User.findById(transaction.memberId._id);
    member.currentBorrowed = Math.max(0, member.currentBorrowed - 1);
    member.totalFines += fine;
    await member.save();

    res.json({
      message: 'Book returned successfully',
      transaction,
      fine
    });
  } catch (error) {
    console.error('Return book error:', error);
    res.status(500).json({ message: 'Server error returning book' });
  }
});

// Renew book
router.put('/:id/renew', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('bookId');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if user owns this transaction (unless admin)
    if (req.user.role !== 'admin' && transaction.memberId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (transaction.status !== 'active') {
      return res.status(400).json({ message: 'Can only renew active transactions' });
    }

    if (transaction.renewalCount >= 2) {
      return res.status(400).json({ message: 'Maximum renewal limit reached' });
    }

    // Check if book is overdue
    if (new Date() > transaction.dueDate) {
      return res.status(400).json({ message: 'Cannot renew overdue books' });
    }

    // Extend due date by 14 days
    const newDueDate = new Date(transaction.dueDate);
    newDueDate.setDate(newDueDate.getDate() + 14);

    transaction.dueDate = newDueDate;
    transaction.renewalCount += 1;
    await transaction.save();

    res.json({
      message: 'Book renewed successfully',
      transaction,
      newDueDate
    });
  } catch (error) {
    console.error('Renew book error:', error);
    res.status(500).json({ message: 'Server error renewing book' });
  }
});

export default router;