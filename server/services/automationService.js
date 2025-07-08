import Transaction from '../models/Transaction.js';
import Reservation from '../models/Reservation.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Send overdue notifications
export const sendOverdueNotifications = async () => {
  try {
    console.log('🔄 Checking for overdue books...');
    
    const overdueTransactions = await Transaction.find({
      status: 'active',
      dueDate: { $lt: new Date() }
    }).populate('bookId memberId');

    for (const transaction of overdueTransactions) {
      const daysOverdue = Math.ceil((new Date() - transaction.dueDate) / (1000 * 60 * 60 * 24));
      const fine = daysOverdue * 0.50;

      // Create notification
      await Notification.create({
        userId: transaction.memberId._id,
        type: 'overdue_reminder',
        title: 'Overdue Book Reminder',
        message: `Your book "${transaction.bookId.title}" is ${daysOverdue} days overdue. Current fine: $${fine.toFixed(2)}`,
        data: {
          transactionId: transaction._id,
          bookId: transaction.bookId._id,
          daysOverdue,
          fine
        },
        priority: 'high'
      });

      // Send email if user has email notifications enabled
      if (transaction.memberId.notificationPreferences?.email && 
          transaction.memberId.notificationPreferences?.overdueReminders) {
        
        const mailOptions = {
          from: process.env.SMTP_USER,
          to: transaction.memberId.email,
          subject: 'Overdue Book Reminder - LibraryPro',
          html: `
            <h2>Overdue Book Reminder</h2>
            <p>Dear ${transaction.memberId.name},</p>
            <p>Your book <strong>"${transaction.bookId.title}"</strong> is ${daysOverdue} days overdue.</p>
            <p>Current fine: <strong>$${fine.toFixed(2)}</strong></p>
            <p>Please return the book as soon as possible to avoid additional charges.</p>
            <p>Thank you,<br>LibraryPro Team</p>
          `
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(`📧 Overdue email sent to ${transaction.memberId.email}`);
        } catch (emailError) {
          console.error('Email send error:', emailError);
        }
      }

      // Update transaction status to overdue
      transaction.status = 'overdue';
      await transaction.save();
    }

    console.log(`✅ Processed ${overdueTransactions.length} overdue notifications`);
  } catch (error) {
    console.error('❌ Error in sendOverdueNotifications:', error);
  }
};

// Send due soon notifications (2 days before due date)
export const sendDueSoonNotifications = async () => {
  try {
    console.log('🔄 Checking for books due soon...');
    
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    
    const dueSoonTransactions = await Transaction.find({
      status: 'active',
      dueDate: {
        $gte: new Date(),
        $lte: twoDaysFromNow
      }
    }).populate('bookId memberId');

    for (const transaction of dueSoonTransactions) {
      const daysUntilDue = Math.ceil((transaction.dueDate - new Date()) / (1000 * 60 * 60 * 24));

      // Create notification
      await Notification.create({
        userId: transaction.memberId._id,
        type: 'due_soon',
        title: 'Book Due Soon',
        message: `Your book "${transaction.bookId.title}" is due in ${daysUntilDue} days.`,
        data: {
          transactionId: transaction._id,
          bookId: transaction.bookId._id,
          daysUntilDue
        },
        priority: 'medium'
      });
    }

    console.log(`✅ Processed ${dueSoonTransactions.length} due soon notifications`);
  } catch (error) {
    console.error('❌ Error in sendDueSoonNotifications:', error);
  }
};

// Expire reservations
export const expireReservations = async () => {
  try {
    console.log('🔄 Checking for expired reservations...');
    
    const expiredReservations = await Reservation.find({
      status: 'active',
      expiryDate: { $lt: new Date() }
    }).populate('bookId memberId');

    for (const reservation of expiredReservations) {
      // Update reservation status
      reservation.status = 'expired';
      await reservation.save();

      // Create notification
      await Notification.create({
        userId: reservation.memberId._id,
        type: 'reservation_expired',
        title: 'Reservation Expired',
        message: `Your reservation for "${reservation.bookId.title}" has expired.`,
        data: {
          reservationId: reservation._id,
          bookId: reservation.bookId._id
        },
        priority: 'medium'
      });
    }

    console.log(`✅ Expired ${expiredReservations.length} reservations`);
  } catch (error) {
    console.error('❌ Error in expireReservations:', error);
  }
};

// Calculate daily fines
export const calculateDailyFines = async () => {
  try {
    console.log('🔄 Calculating daily fines...');
    
    const overdueTransactions = await Transaction.find({
      status: { $in: ['active', 'overdue'] },
      dueDate: { $lt: new Date() }
    }).populate('memberId');

    for (const transaction of overdueTransactions) {
      const daysOverdue = Math.ceil((new Date() - transaction.dueDate) / (1000 * 60 * 60 * 24));
      const newFine = daysOverdue * 0.50;

      // Update transaction fine
      transaction.fine = newFine;
      await transaction.save();

      // Update user's total fines
      const user = await User.findById(transaction.memberId._id);
      if (user) {
        // Recalculate total fines from all transactions
        const userTransactions = await Transaction.find({
          memberId: user._id,
          status: { $in: ['returned', 'overdue'] }
        });
        
        const totalFines = userTransactions.reduce((sum, t) => sum + (t.fine || 0), 0);
        user.totalFines = totalFines;
        await user.save();
      }
    }

    console.log(`✅ Updated fines for ${overdueTransactions.length} transactions`);
  } catch (error) {
    console.error('❌ Error in calculateDailyFines:', error);
  }
};

// Notify about available reservations
export const notifyAvailableReservations = async () => {
  try {
    console.log('🔄 Checking for available reserved books...');
    
    // Find books that became available and have active reservations
    const availableBooks = await Transaction.aggregate([
      {
        $lookup: {
          from: 'books',
          localField: 'bookId',
          foreignField: '_id',
          as: 'book'
        }
      },
      {
        $unwind: '$book'
      },
      {
        $match: {
          status: 'returned',
          returnDate: {
            $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      },
      {
        $group: {
          _id: '$bookId',
          book: { $first: '$book' }
        }
      }
    ]);

    for (const { _id: bookId, book } of availableBooks) {
      // Find the highest priority active reservation for this book
      const reservation = await Reservation.findOne({
        bookId,
        status: 'active'
      }).sort({ priority: 1 }).populate('memberId');

      if (reservation && book.availableCopies > 0) {
        // Create notification
        await Notification.create({
          userId: reservation.memberId._id,
          type: 'reservation_available',
          title: 'Reserved Book Available',
          message: `Your reserved book "${book.title}" is now available for pickup.`,
          data: {
            reservationId: reservation._id,
            bookId: book._id
          },
          priority: 'high',
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });

        // Send email notification
        if (reservation.memberId.notificationPreferences?.email && 
            reservation.memberId.notificationPreferences?.reservationUpdates) {
          
          const mailOptions = {
            from: process.env.SMTP_USER,
            to: reservation.memberId.email,
            subject: 'Reserved Book Available - LibraryPro',
            html: `
              <h2>Reserved Book Available</h2>
              <p>Dear ${reservation.memberId.name},</p>
              <p>Great news! Your reserved book <strong>"${book.title}"</strong> is now available for pickup.</p>
              <p>Please visit the library within 7 days to collect your book.</p>
              <p>Thank you,<br>LibraryPro Team</p>
            `
          };

          try {
            await transporter.sendMail(mailOptions);
            console.log(`📧 Reservation email sent to ${reservation.memberId.email}`);
          } catch (emailError) {
            console.error('Email send error:', emailError);
          }
        }

        reservation.notificationSent = true;
        await reservation.save();
      }
    }

    console.log(`✅ Processed reservation notifications for ${availableBooks.length} books`);
  } catch (error) {
    console.error('❌ Error in notifyAvailableReservations:', error);
  }
};