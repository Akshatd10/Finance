import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
import memberRoutes from './routes/members.js';
import transactionRoutes from './routes/transactions.js';
import reservationRoutes from './routes/reservations.js';
import donationRoutes from './routes/donations.js';
import requestRoutes from './routes/requests.js';
import plagiarismRoutes from './routes/plagiarism.js';
import notificationRoutes from './routes/notifications.js';
import { sendOverdueNotifications, expireReservations, calculateDailyFines } from './services/automationService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/library-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch((error) => console.error('❌ MongoDB connection error:', error));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/plagiarism', plagiarismRoutes);
app.use('/api/notifications', notificationRoutes);

// Automated Tasks
// Run every day at 9 AM
cron.schedule('0 9 * * *', async () => {
  console.log('🔄 Running daily automation tasks...');
  try {
    await sendOverdueNotifications();
    await expireReservations();
    await calculateDailyFines();
    console.log('✅ Daily automation tasks completed');
  } catch (error) {
    console.error('❌ Error in daily automation:', error);
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Library Management System API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});