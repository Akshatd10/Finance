import React, { useState } from 'react';
import { Activity, Search, BookOpen, User, Calendar, DollarSign, Check, X } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

const TransactionsManagement = () => {
  const { transactions, books, members, returnBook, issueBook, calculateFine } = useLibrary();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueFormData, setIssueFormData] = useState({
    bookId: '',
    memberId: ''
  });

  const filteredTransactions = transactions.filter(transaction => {
    const book = books.find(b => b.id === transaction.bookId);
    const member = members.find(m => m.id === transaction.memberId);
    
    const matchesSearch = book?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member?.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleIssueBook = (e: React.FormEvent) => {
    e.preventDefault();
    issueBook(issueFormData.bookId, issueFormData.memberId);
    setIssueFormData({ bookId: '', memberId: '' });
    setShowIssueModal(false);
  };

  const handleReturnBook = (transactionId: string) => {
    returnBook(transactionId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Transactions Management</h1>
          <p className="text-gray-300">Track book issues, returns, and fines</p>
        </div>
        <button
          onClick={() => setShowIssueModal(true)}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105"
        >
          <BookOpen className="h-5 w-5 mr-2" />
          Issue Book
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
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
          <option value="returned">Returned</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.map((transaction) => {
          const book = books.find(b => b.id === transaction.bookId);
          const member = members.find(m => m.id === transaction.memberId);
          const currentFine = transaction.status === 'active' ? 
            calculateFine(transaction.dueDate) : transaction.fine;
          const isOverdue = transaction.status === 'active' && new Date(transaction.dueDate) < new Date();

          return (
            <div key={transaction.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{book?.title}</h3>
                      <p className="text-gray-300 text-sm">by {book?.author}</p>
                    </div>
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                      transaction.status === 'active' ? (isOverdue ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300') :
                      transaction.status === 'returned' ? 'bg-emerald-500/20 text-emerald-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {transaction.status === 'active' && isOverdue ? 'Overdue' : transaction.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center text-gray-300">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      {member?.name}
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      Issued: {transaction.issueDate}
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      Due: {transaction.dueDate}
                    </div>
                    {transaction.returnDate && (
                      <div className="flex items-center text-gray-300">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        Returned: {transaction.returnDate}
                      </div>
                    )}
                  </div>

                  {currentFine > 0 && (
                    <div className="flex items-center text-red-400">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Fine: ${currentFine.toFixed(2)}
                    </div>
                  )}
                </div>

                {transaction.status === 'active' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleReturnBook(transaction.id)}
                      className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Return Book
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Issue Book Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6">Issue Book</h2>
            
            <form onSubmit={handleIssueBook} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Book</label>
                <select
                  value={issueFormData.bookId}
                  onChange={(e) => setIssueFormData({...issueFormData, bookId: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">Choose a book</option>
                  {books.filter(book => book.availableCopies > 0).map(book => (
                    <option key={book.id} value={book.id}>
                      {book.title} - Available: {book.availableCopies}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Member</label>
                <select
                  value={issueFormData.memberId}
                  onChange={(e) => setIssueFormData({...issueFormData, memberId: e.target.value})}
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

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-6 py-3 text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-all duration-200"
                >
                  Issue Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsManagement;