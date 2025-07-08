import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  BookOpen, 
  User, 
  Activity, 
  Calendar, 
  Search,
  LogOut,
  Menu,
  X,
  Home,
  Gift,
  MessageSquare,
  FileText,
  Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import BookCatalog from './BookCatalog';
import MyTransactions from './MyTransactions';
import MyReservations from './MyReservations';
import Profile from './Profile';
import BookDonations from './BookDonations';
import BookRequests from './BookRequests';
import PlagiarismChecker from './PlagiarismChecker';

const StudentDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { books, transactions, reservations } = useLibrary();
  const location = useLocation();

  if (!user || user.role !== 'student') {
    return <Navigate to="/login" replace />;
  }

  const navigation = [
    { name: 'Dashboard', href: '/student', icon: Home },
    { name: 'Browse Books', href: '/student/books', icon: BookOpen },
    { name: 'My Transactions', href: '/student/transactions', icon: Activity },
    { name: 'My Reservations', href: '/student/reservations', icon: Calendar },
    { name: 'Plagiarism Checker', href: '/student/plagiarism', icon: FileText },
    { name: 'Donate Books', href: '/student/donations', icon: Gift },
    { name: 'Request Books', href: '/student/requests', icon: MessageSquare },
    { name: 'Profile', href: '/student/profile', icon: User },
  ];

  const myTransactions = transactions.filter(t => t.memberId === user.id);
  const myReservations = reservations.filter(r => r.memberId === user.id);
  const activeTransactions = myTransactions.filter(t => t.status === 'active');
  const overdueTransactions = myTransactions.filter(t => 
    t.status === 'active' && new Date(t.dueDate) < new Date()
  );

  const DashboardHome = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
        <p className="text-emerald-100">Discover your next great read from our extensive collection.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Currently Borrowed</p>
              <p className="text-3xl font-semibold text-white">{activeTransactions.length}</p>
            </div>
            <BookOpen className="h-12 w-12 text-emerald-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Active Reservations</p>
              <p className="text-3xl font-semibold text-white">{myReservations.filter(r => r.status === 'active').length}</p>
            </div>
            <Calendar className="h-12 w-12 text-blue-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Overdue Books</p>
              <p className="text-3xl font-semibold text-white">{overdueTransactions.length}</p>
            </div>
            <Activity className="h-12 w-12 text-red-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-300">Available Books</p>
              <p className="text-3xl font-semibold text-white">{books.reduce((sum, book) => sum + book.availableCopies, 0)}</p>
            </div>
            <Search className="h-12 w-12 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Currently Borrowed Books */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Currently Borrowed</h3>
          {activeTransactions.length > 0 ? (
            <div className="space-y-4">
              {activeTransactions.slice(0, 3).map((transaction) => {
                const book = books.find(b => b.id === transaction.bookId);
                const isOverdue = new Date(transaction.dueDate) < new Date();
                return (
                  <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0">
                    <div>
                      <p className="text-white font-medium">{book?.title}</p>
                      <p className="text-gray-300 text-sm">Due: {transaction.dueDate}</p>
                    </div>
                    <span className={`text-sm font-medium ${
                      isOverdue ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {isOverdue ? 'Overdue' : 'Active'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400">No books currently borrowed</p>
          )}
        </div>

        {/* Featured Books */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Featured Books</h3>
          <div className="space-y-4">
            {books.filter(book => book.availableCopies > 0).slice(0, 3).map((book) => (
              <div key={book.id} className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0">
                <div>
                  <p className="text-white font-medium">{book.title}</p>
                  <p className="text-gray-300 text-sm">by {book.author}</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 text-sm">{book.availableCopies} available</p>
                  <p className="text-gray-400 text-xs">{book.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/student/books"
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105"
        >
          <BookOpen className="h-8 w-8 mb-3" />
          <h3 className="text-lg font-semibold mb-2">Browse Books</h3>
          <p className="text-emerald-100 text-sm">Explore our extensive collection</p>
        </Link>

        <Link
          to="/student/plagiarism"
          className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
        >
          <FileText className="h-8 w-8 mb-3" />
          <h3 className="text-lg font-semibold mb-2">Check Plagiarism</h3>
          <p className="text-purple-100 text-sm">Verify document originality</p>
        </Link>

        <Link
          to="/student/donations"
          className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl p-6 text-white hover:from-pink-600 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
        >
          <Gift className="h-8 w-8 mb-3" />
          <h3 className="text-lg font-semibold mb-2">Donate Books</h3>
          <p className="text-pink-100 text-sm">Help expand our collection</p>
        </Link>

        <Link
          to="/student/requests"
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
        >
          <MessageSquare className="h-8 w-8 mb-3" />
          <h3 className="text-lg font-semibold mb-2">Request Books</h3>
          <p className="text-blue-100 text-sm">Request new books for the library</p>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white/10 backdrop-blur-xl border-r border-white/20 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static`}>
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-emerald-400" />
            <span className="text-xl font-bold text-white">LibraryPro</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors duration-200 ${
                location.pathname === item.href
                  ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-lg transition-colors duration-200"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm border-b border-white/20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white hover:text-gray-300"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold text-white">Student Portal</h1>
          <Bell className="h-6 w-6 text-white" />
        </div>

        {/* Page Content */}
        <div className="p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/books" element={<BookCatalog />} />
            <Route path="/transactions" element={<MyTransactions />} />
            <Route path="/reservations" element={<MyReservations />} />
            <Route path="/plagiarism" element={<PlagiarismChecker />} />
            <Route path="/donations" element={<BookDonations />} />
            <Route path="/requests" element={<BookRequests />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default StudentDashboard;