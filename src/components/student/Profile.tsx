import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, BookOpen, Activity, DollarSign, Edit, Save, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';

const Profile = () => {
  const { user } = useAuth();
  const { transactions, members, calculateFine } = useLibrary();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    department: ''
  });

  const member = members.find(m => m.email === user?.email);
  const myTransactions = transactions.filter(t => t.memberId === user?.id);
  
  const stats = {
    totalBorrowed: myTransactions.length,
    currentlyBorrowed: myTransactions.filter(t => t.status === 'active').length,
    totalReturned: myTransactions.filter(t => t.status === 'returned').length,
    totalFines: myTransactions.reduce((sum, t) => {
      if (t.status === 'returned') return sum + t.fine;
      if (t.status === 'active') return sum + calculateFine(t.dueDate);
      return sum;
    }, 0),
    overdueBooks: myTransactions.filter(t => 
      t.status === 'active' && new Date(t.dueDate) < new Date()
    ).length
  };

  const handleSave = () => {
    // In a real app, this would update the user profile
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      name: user?.name || '',
      email: user?.email || '',
      phone: member?.phone || '',
      department: member?.department || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">My Profile</h1>
        <p className="text-gray-300">Manage your account information and view your library statistics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Personal Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{user?.name}</h3>
                  <p className="text-gray-300 text-sm">Student Member</p>
                  {member?.studentId && (
                    <p className="text-gray-400 text-sm">ID: {member.studentId}</p>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  ) : (
                    <div className="flex items-center text-white">
                      <User className="h-4 w-4 mr-3 text-gray-400" />
                      {user?.name}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({...editData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  ) : (
                    <div className="flex items-center text-white">
                      <Mail className="h-4 w-4 mr-3 text-gray-400" />
                      {user?.email}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData({...editData, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <div className="flex items-center text-white">
                      <Phone className="h-4 w-4 mr-3 text-gray-400" />
                      {member?.phone || 'Not provided'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                  {isEditing ? (
                    <select
                      value={editData.department}
                      onChange={(e) => setEditData({...editData, department: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select Department</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Finance Management">Finance Management</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Business Administration">Business Administration</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <div className="flex items-center text-white">
                      <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                      {member?.department || 'Not specified'}
                    </div>
                  )}
                </div>
              </div>

              {member?.joinDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Member Since</label>
                  <div className="flex items-center text-white">
                    <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                    {new Date(member.joinDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="space-y-6">
          {/* Library Statistics */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Library Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-blue-400 mr-3" />
                  <span className="text-gray-300">Total Borrowed</span>
                </div>
                <span className="text-white font-semibold">{stats.totalBorrowed}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-yellow-400 mr-3" />
                  <span className="text-gray-300">Currently Borrowed</span>
                </div>
                <span className="text-white font-semibold">{stats.currentlyBorrowed}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-emerald-400 mr-3" />
                  <span className="text-gray-300">Total Returned</span>
                </div>
                <span className="text-white font-semibold">{stats.totalReturned}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-orange-400 mr-3" />
                  <span className="text-gray-300">Total Fines</span>
                </div>
                <span className="text-white font-semibold">${stats.totalFines.toFixed(2)}</span>
              </div>

              {stats.overdueBooks > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-red-400 mr-3" />
                    <span className="text-red-300">Overdue Books</span>
                  </div>
                  <span className="text-red-400 font-semibold">{stats.overdueBooks}</span>
                </div>
              )}
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Account Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  member?.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  {member?.status || 'Active'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Outstanding Fines</span>
                <span className={`font-semibold ${
                  stats.totalFines > 0 ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  ${stats.totalFines.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;