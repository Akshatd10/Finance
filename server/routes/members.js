import express from 'express';
import User from '../models/User.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all members (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    
    const filter = { role: 'student' };
    if (status) filter.status = status;
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    const members = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      members,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Fetch members error:', error);
    res.status(500).json({ message: 'Server error fetching members' });
  }
});

// Update member status (admin only)
router.put('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const member = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({
      message: 'Member status updated successfully',
      member
    });
  } catch (error) {
    console.error('Update member status error:', error);
    res.status(500).json({ message: 'Server error updating member status' });
  }
});

export default router;