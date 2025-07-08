import React, { useState } from 'react';
import { Activity, BookOpen, Calendar, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';

const MyTransactions = () => {
  const { transactions, books, calculateFine } = useLibrary();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');

  const myTransactions = transactions.filter(t => t.memberId === user?.id);
  
  const filteredTransactions = myTransactions.filter(transaction => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'overdue') {
      return transaction.status === 'active' && new Date(transaction.dueDate) < new Date();
    }
    return transaction.status === statusFilter;
  });

  const stats = {
    total: myTransactions.length,
    active: myTransactions.filter(t => t.status === 'active').length,
    returned: myTransactions.filter(t => t.status === 'returned').length,
    overdue: myTransactions.filter(t => 
      t.status === 'active' && new Date(t.dueDate) < new Date()
    ).length,
    totalFines: myTransactions.reduce((sum, t) => {
      if (t.status === 'returned') return sum + t.fine;
      if (t.status === 'active') return sum + calculateFine(t.dueDate);
      return sum;
    }, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">My Transactions</h1>
        <p className="text-gray-300">Track your borrowing history and current loans</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Total Borrowed</p>
              <p className="text-2xl font-semibold text-white">{stats.total}</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Currently Active</p>
              <p className="text-2xl font-semibold text-white">{stats.active}</p>
            </div>
            <Activity className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Returned</p>
              <p className="text-2xl font-semibold text-white">{stats.returned}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Overdue</p>
              <p className="text-2xl font-semibold text-white">{stats.overdue}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Total Fines</p>
              <p className="text-2xl font-semibold text-white">${stats.totalFines.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-orange-400" />
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
          <option value="all">All Transactions</option>
          <option value="active">Currently Borrowed</option>
          <option value="returned">Returned</option>
          <option value="overdue">Overdue</option>
        </select>
        
        <p className="text-gray-300 text-sm">
          Showing {filteredTransactions.length} transactions
        </p>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.map((transaction) => {
          const book = books.find(b => b.id === transaction.bookId);
          const isOverdue = transaction.status === 'active' && new Date(transaction.dueDate) < new Date();
          const currentFine = transaction.status === 'active' ? 
            calculateFine(transaction.dueDate) : transaction.fine;

          return (
            <div key={transaction.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{book?.title}</h3>
                      <p className="text-gray-300 text-sm">by {book?.author}</p>
                    </div>
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                      transaction.status === 'active' ? (isOverdue ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300') :
                      transaction.status === 'returned' ? 'bg-emerald-500/20 text-emerald-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {transaction.status === 'active' && isOverdue ? 'Overdue' : transaction.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                    {currentFine > 0 && (
                      <div className="flex items-center text-red-400">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Fine: ${currentFine.toFixed(2)}
                      </div>
                    )}
                  </div>

                  {isOverdue && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-center text-red-400 text-sm">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        This book is overdue. Please return it as soon as possible to avoid additional fines.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Transactions */}
      {filteredTransactions.length === 0 && (
        <div className="text-center py-12">
          <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No transactions found</h3>
          <p className="text-gray-400">
            {statusFilter === 'all' 
              ? "You haven't borrowed any books yet. Start exploring our catalog!"
              : `No ${statusFilter} transactions found.`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default MyTransactions;