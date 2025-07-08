import React, { useState } from 'react';
import { Calendar, Search, Plus, User, Clock, Check, X } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { toast } from 'react-hot-toast';

const ReservationsManagement = () => {
  const { reservations, books, members, reserveBook, cancelReservation } = useLibrary();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [reserveFormData, setReserveFormData] = useState({
    bookId: '',
    memberId: '',
    days: 7
  });

  const filteredReservations = reservations.filter(reservation => {
    const book = books.find(b => b.id === reservation.bookId);
    const member = members.find(m => m.id === reservation.memberId);
    
    const matchesSearch = book?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member?.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = false;
    if (statusFilter === 'all') {
      matchesStatus = true;
    } else if (statusFilter === 'expired') {
      matchesStatus = reservation.status === 'active' && new Date(reservation.expiryDate) < new Date();
    } else {
      matchesStatus = reservation.status === statusFilter;
    }
    
    return matchesSearch && matchesStatus;
  });

  const handleReserveBook = (e: React.FormEvent) => {
    e.preventDefault();

    const alreadyReserved = reservations.some(res =>
      res.bookId === reserveFormData.bookId &&
      res.memberId === reserveFormData.memberId &&
      (res.status === 'active' || res.status === 'expired')
    );

    if (alreadyReserved) {
      toast.error('This member has already reserved this book.');
      return;
    }

    reserveBook(reserveFormData.bookId, reserveFormData.memberId, reserveFormData.days);
    toast.success('Reservation created successfully.');
    setReserveFormData({ bookId: '', memberId: '', days: 7 });
    setShowReserveModal(false);
  };

  const handleCancelReservation = (reservationId: string) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      cancelReservation(reservationId);
      toast.success('Reservation cancelled.');
    }
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Reservations Management</h1>
          <p className="text-gray-300">Manage book reservations and waiting lists</p>
        </div>
        <button
          onClick={() => setShowReserveModal(true)}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Reservation
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search reservations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Reservations List */}
      <div className="space-y-4">
        {filteredReservations.map((reservation) => {
          const book = books.find(b => b.id === reservation.bookId);
          const member = members.find(m => m.id === reservation.memberId);
          const expired = isExpired(reservation.expiryDate);
          const actualStatus = reservation.status === 'active' && expired ? 'expired' : reservation.status;

          return (
            <div key={reservation.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
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
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      {member?.name}
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      Reserved: {reservation.reservationDate}
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      Expires: {reservation.expiryDate}
                    </div>
                  </div>

                  {member?.email && (
                    <div className="text-sm text-gray-400">
                      Contact: {member.email}
                    </div>
                  )}
                </div>

                {actualStatus === 'active' && (
                  <div className="flex space-x-2">
                    <button className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200">
                      <Check className="h-4 w-4 mr-2" />
                      Fulfill
                    </button>
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

      {/* Reserve Book Modal */}
      {showReserveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6">Create Reservation</h2>
            
            <form onSubmit={handleReserveBook} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Book</label>
                <select
                  value={reserveFormData.bookId}
                  onChange={(e) => setReserveFormData({...reserveFormData, bookId: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">Choose a book</option>
                  {books.map(book => (
                    <option key={book.id} value={book.id}>
                      {book.title} - Available: {book.availableCopies}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Member</label>
                <select
                  value={reserveFormData.memberId}
                  onChange={(e) => setReserveFormData({...reserveFormData, memberId: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">Choose a member</option>
                  {members.filter(member => member.status === 'active').map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} - {member.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Reservation Duration (days)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={reserveFormData.days}
                  onChange={(e) => setReserveFormData({...reserveFormData, days: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <p className="text-gray-400 text-sm mt-1">Reservation will expire after this many days</p>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowReserveModal(false)}
                  className="px-6 py-3 text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-all duration-200"
                >
                  Create Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationsManagement;
