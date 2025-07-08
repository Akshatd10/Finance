import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Activity, 
  Calendar, 
  DollarSign, 
  Settings, 
  LogOut,
  Menu,
  X,
  Home,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import BooksManagement from './BooksManagement';
import MembersManagement from './MembersManagement';
import TransactionsManagement from './TransactionsManagement';
import ReservationsManagement from './ReservationsManagement';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { books, members, transactions, getOverdueTransactions } = useLibrary();
  const location = useLocation();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Books', href: '/admin/books', icon: BookOpen },
    { name: 'Members', href: '/admin/members', icon: Users },
    { name: 'Transactions', href: '/admin/transactions', icon: Activity },
    { name: 'Reservations', href: '/admin/reservations', icon: Calendar },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const stats = [
    {
      name: 'Total Books',
      value: books.length,
      change: '+12%',
      changeType: 'positive',
      icon: BookOpen,
    },
    {
      name: 'Active Members',
      value: members.filter(m => m.status === 'active').length,
      change: '+8%',
      changeType: 'positive',
      icon: Users,
    },
    {
      name: 'Active Transactions',
      value: transactions.filter(t => t.status === 'active').length,
      change: '-2%',
      changeType: 'negative',
      icon: Activity,
    },
    {
      name: 'Overdue Books',
      value: getOverdueTransactions().length,
      change: '+15%',
      changeType: 'negative',
      icon: AlertCircle,
    },
  ];

  const DashboardHome = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
        <p className="text-indigo-100">Here's what's happening in your library today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">{stat.name}</p>
                <p className="text-3xl font-semibold text-white">{stat.value}</p>
                <p className={`text-sm ${
                  stat.changeType === 'positive' ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {stat.change} from last month
                </p>
              </div>
              <stat.icon className="h-12 w-12 text-indigo-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Transactions</h3>
          <div className="space-y-4">
            {transactions.slice(0, 5).map((transaction) => {
              const book = books.find(b => b.id === transaction.bookId);
              const member = members.find(m => m.id === transaction.memberId);
              return (
                <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0">
                  <div>
                    <p className="text-white font-medium">{book?.title}</p>
                    <p className="text-gray-300 text-sm">{member?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      transaction.status === 'active' ? 'text-yellow-400' : 
                      transaction.status === 'returned' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {transaction.status}
                    </p>
                    <p className="text-gray-400 text-xs">{transaction.issueDate}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Overdue Books */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Overdue Books</h3>
          <div className="space-y-4">
            {getOverdueTransactions().slice(0, 5).map((transaction) => {
              const book = books.find(b => b.id === transaction.bookId);
              const member = members.find(m => m.id === transaction.memberId);
              const fine = Math.max(0, Math.ceil((new Date().getTime() - new Date(transaction.dueDate).getTime()) / (1000 * 60 * 60 * 24)) * 0.50);
              return (
                <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0">
                  <div>
                    <p className="text-white font-medium">{book?.title}</p>
                    <p className="text-gray-300 text-sm">{member?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-400 font-medium">${fine.toFixed(2)}</p>
                    <p className="text-gray-400 text-xs">Due: {transaction.dueDate}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
          <h1 className="text-xl font-semibold text-white">Admin Dashboard</h1>
          <div></div>
        </div>

        {/* Page Content */}
        <div className="p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/books" element={<BooksManagement />} />
            <Route path="/members" element={<MembersManagement />} />
            <Route path="/transactions" element={<TransactionsManagement />} />
            <Route path="/reservations" element={<ReservationsManagement />} />
            <Route path="/settings" element={
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-4">Settings</h2>
                <p className="text-gray-300">Settings panel coming soon...</p>
              </div>
            } />
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

export default AdminDashboard;