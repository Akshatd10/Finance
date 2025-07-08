import express from 'express';
import Reservation from '../models/Reservation.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Get reservations
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    
    // If not admin, only show user's reservations
    if (req.user.role !== 'admin') {
      filter.memberId = req.user.userId;
    }
    
    if (status) filter.status = status;

    const reservations = await Reservation.find(filter)
      .populate('bookId', 'title author isbn')
      .populate('memberId', 'name email studentId')
      .sort({ priority: 1, createdAt: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Reservation.countDocuments(filter);

    res.json({
      reservations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Fetch reservations error:', error);
    res.status(500).json({ message: 'Server error fetching reservations' });
  }
});

// Create reservation
router.post('/', auth, async (req, res) => {
  try {
    const { bookId, days = 7 } = req.body;

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user already has an active reservation for this book
    const existingReservation = await Reservation.findOne({
      bookId,
      memberId: req.user.userId,
      status: 'active'
    });

    if (existingReservation) {
      return res.status(400).json({ message: 'You already have an active reservation for this book' });
    }

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    // Get next priority number for this book
    const lastReservation = await Reservation.findOne({
      bookId,
      status: 'active'
    }).sort({ priority: -1 });

    const priority = lastReservation ? lastReservation.priority + 1 : 1;

    const reservation = new Reservation({
      bookId,
      memberId: req.user.userId,
      expiryDate,
      priority
    });

    await reservation.save();

    // Update book popularity
    book.popularity.reservationCount += 1;
    await book.save();

    res.status(201).json({
      message: 'Reservation created successfully',
      reservation
    });
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({ message: 'Server error creating reservation' });
  }
});

// Cancel reservation
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check if user owns this reservation (unless admin)
    if (req.user.role !== 'admin' && reservation.memberId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (reservation.status !== 'active') {
      return res.status(400).json({ message: 'Can only cancel active reservations' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    res.json({
      message: 'Reservation cancelled successfully',
      reservation
    });
  } catch (error) {
    console.error('Cancel reservation error:', error);
    res.status(500).json({ message: 'Server error cancelling reservation' });
  }
});

// Fulfill reservation (admin only)
router.put('/:id/fulfill', adminAuth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (reservation.status !== 'active') {
      return res.status(400).json({ message: 'Can only fulfill active reservations' });
    }

    reservation.status = 'fulfilled';
    await reservation.save();

    res.json({
      message: 'Reservation fulfilled successfully',
      reservation
    });
  } catch (error) {
    console.error('Fulfill reservation error:', error);
    res.status(500).json({ message: 'Server error fulfilling reservation' });
  }
});

export default router;