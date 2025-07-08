import React, { useState } from 'react';
import { Calendar, BookOpen, Clock, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';

const MyReservations = () => {
  const { reservations, books, cancelReservation } = useLibrary();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');

  const myReservations = reservations.filter(r => r.memberId === user?.id);
  
  const filteredReservations = myReservations.filter(reservation => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'expired') {
      return reservation.status === 'active' && new Date(reservation.expiryDate) < new Date();
    }
    return reservation.status === statusFilter;
  });

  const stats = {
    total: myReservations.length,
    active: myReservations.filter(r => r.status === 'active' && new Date(r.expiryDate) >= new Date()).length,
    expired: myReservations.filter(r => 
      r.status === 'active' && new Date(r.expiryDate) < new Date()
    ).length,
    fulfilled: myReservations.filter(r => r.status === 'fulfilled').length,
    cancelled: myReservations.filter(r => r.status === 'cancelled').length
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleCancelReservation = (reservationId: string) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      cancelReservation(reservationId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">My Reservations</h1>
        <p className="text-gray-300">Manage your book reservations and waiting lists</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Total Reservations</p>
              <p className="text-2xl font-semibold text-white">{stats.total}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Active</p>
              <p className="text-2xl font-semibold text-white">{stats.active}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Fulfilled</p>
              <p className="text-2xl font-semibold text-white">{stats.fulfilled}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Expired</p>
              <p className="text-2xl font-semibold text-white">{stats.expired}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Cancelled</p>
              <p className="text-2xl font-semibold text-white">{stats.cancelled}</p>
            </div>
            <X className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex justify-between items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Reservations</option>
          <option value="active">Active</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
        
        <p className="text-gray-300 text-sm">
          Showing {filteredReservations.length} reservations
        </p>
      </div>

      {/* Reservations List */}
      <div className="space-y-4">
        {filteredReservations.map((reservation) => {
          const book = books.find(b => b.id === reservation.bookId);
          const expired = isExpired(reservation.expiryDate);
          const actualStatus = reservation.status === 'active' && expired ? 'expired' : reservation.status;
          const daysUntilExpiry = getDaysUntilExpiry(reservation.expiryDate);

          return (
            <div key={reservation.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{book?.title}</h3>
                      <p className="text-gray-300 text-sm">by {book?.author}</p>
                    </div>
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                      actualStatus === 'active' ? 'bg-blue-500/20 text-blue-300' :
                      actualStatus === 'fulfilled' ? 'bg-emerald-500/20 text-emerald-300' :
                      actualStatus === 'cancelled' ? 'bg-gray-500/20 text-gray-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {actualStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-gray-300">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      Reserved: {reservation.reservationDate}
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      Expires: {reservation.expiryDate}
                    </div>
                    {actualStatus === 'active' && !expired && (
                      <div className="flex items-center text-yellow-400">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {daysUntilExpiry > 0 ? `${daysUntilExpiry} days left` : 'Expires today'}
                      </div>
                    )}
                  </div>

                  {actualStatus === 'active' && (
                    <div className="mt-3">
                      {expired ? (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <div className="flex items-center text-red-400 text-sm">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            This reservation has expired. You may need to create a new reservation.
                          </div>
                        </div>
                      ) : daysUntilExpiry <= 2 ? (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <div className="flex items-center text-yellow-400 text-sm">
                            <Clock className="h-4 w-4 mr-2" />
                            Your reservation expires soon. The book should be available for pickup shortly.
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <div className="flex items-center text-blue-400 text-sm">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Your reservation is active. You'll be notified when the book becomes available.
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {actualStatus === 'fulfilled' && (
                    <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <div className="flex items-center text-emerald-400 text-sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Reservation fulfilled! The book has been issued to you.
                      </div>
                    </div>
                  )}

                  {actualStatus === 'cancelled' && (
                    <div className="mt-3 p-3 bg-gray-500/10 border border-gray-500/20 rounded-lg">
                      <div className="flex items-center text-gray-400 text-sm">
                        <X className="h-4 w-4 mr-2" />
                        This reservation was cancelled.
                      </div>
                    </div>
                  )}
                </div>

                {actualStatus === 'active' && !expired && (
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleCancelReservation(reservation.id)}
                      className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* No Reservations */}
      {filteredReservations.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No reservations found</h3>
          <p className="text-gray-400">
            {statusFilter === 'all' 
              ? "You haven't made any reservations yet. Browse our catalog to reserve books!"
              : `No ${statusFilter} reservations found.`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default MyReservations;