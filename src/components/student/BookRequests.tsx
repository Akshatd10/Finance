import React, { useState } from 'react';
import { MessageSquare, Plus, BookOpen, Clock, CheckCircle, X, AlertCircle, Users, TrendingUp } from 'lucide-react';

const BookRequests = () => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestFormData, setRequestFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Computer Science' as const,
    publishedYear: new Date().getFullYear(),
    publisher: '',
    reason: '',
    priority: 'medium' as const,
    estimatedCost: ''
  });
  const [showSharedView, setShowSharedView] = useState<null | string>(null);


  // Mock data for demonstration
  const [requests, setRequests] = useState([
    {
      id: '1',
      title: 'Machine Learning with Python',
      author: 'Sebastian Raschka',
      category: 'Computer Science',
      priority: 'high',
      status: 'approved',
      submittedDate: '2024-01-10',
      supportCount: 15,
      reason: 'Essential for our ML course project',
      reviewNotes: 'Approved for purchase. Expected delivery in 2 weeks.'
    },
    {
      id: '2',
      title: 'Blockchain Technology Fundamentals',
      author: 'Various Authors',
      category: 'Computer Science',
      priority: 'medium',
      status: 'pending',
      submittedDate: '2024-01-18',
      supportCount: 8,
      reason: 'Growing interest in blockchain technology among students'
    }
  ]);
  
  

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Request submitted:', requestFormData);
    setShowRequestModal(false);
    setRequestFormData({
      title: '',
      author: '',
      isbn: '',
      category: 'Computer Science',
      publishedYear: new Date().getFullYear(),
      publisher: '',
      reason: '',
      priority: 'medium',
      estimatedCost: ''
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-400" />;
      case 'under_review':
        return <AlertCircle className="h-5 w-5 text-blue-400" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case 'rejected':
        return <X className="h-5 w-5 text-red-400" />;
      case 'ordered':
        return <TrendingUp className="h-5 w-5 text-purple-400" />;
      case 'received':
        return <BookOpen className="h-5 w-5 text-blue-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'under_review':
        return 'bg-blue-500/20 text-blue-300';
      case 'approved':
        return 'bg-emerald-500/20 text-emerald-300';
      case 'rejected':
        return 'bg-red-500/20 text-red-300';
      case 'ordered':
        return 'bg-purple-500/20 text-purple-300';
      case 'received':
        return 'bg-blue-500/20 text-blue-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-300';
      case 'high':
        return 'bg-orange-500/20 text-orange-300';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'low':
        return 'bg-green-500/20 text-green-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Book Requests</h1>
          <p className="text-gray-300">Request books that aren't currently in our collection</p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="h-5 w-5 mr-2" />
          Request a Book
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20">
        <div className="flex items-start space-x-4">
          <MessageSquare className="h-8 w-8 text-blue-400 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">How Book Requests Work</h3>
            <ul className="text-gray-300 space-y-1 text-sm">
              <li>• Submit a request for books not currently in our collection</li>
              <li>• Other students can support your request to show demand</li>
              <li>• Library staff reviews requests based on priority and support</li>
              <li>• Approved books are ordered and added to the collection</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">My Requests</h2>
        
        {requests.length > 0 ? (
          requests.map((request) => (
            <div key={request.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{request.title}</h3>
                      <p className="text-gray-300 text-sm">by {request.author}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(request.status)}
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(request.status)}`}>
                        {request.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-400">Category:</span>
                      <p className="text-white">{request.category}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Priority:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Submitted:</span>
                      <p className="text-white">{request.submittedDate}</p>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-white">{request.supportCount} supporters</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className="text-gray-400 text-sm">Reason:</span>
                    <p className="text-white text-sm mt-1">{request.reason}</p>
                  </div>

                  {request.reviewNotes && (
                    <div className="p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-400 text-sm">Review Notes:</span>
                      <p className="text-white text-sm mt-1">{request.reviewNotes}</p>
                    </div>
                  )}
                </div>

                {request.status === 'pending' && (
                <div className="flex items-center space">

                  {/* Share Button */}
                  <button
                    onClick={() => {
                      const link = `${window.location.origin}/book-request/${request.id}`;
                      navigator.clipboard.writeText(link);
                      setShowSharedView(request.id); // simulate opening shared view
                    }}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Share Request ({request.supportCount})
                  </button>

                </div>
              )}

              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No requests yet</h3>
            <p className="text-gray-400">Request your first book to help expand our collection!</p>
          </div>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Request a Book</h2>
            
            <form onSubmit={handleSubmitRequest} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Book Title</label>
                  <input
                    type="text"
                    value={requestFormData.title}
                    onChange={(e) => setRequestFormData({...requestFormData, title: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Author</label>
                  <input
                    type="text"
                    value={requestFormData.author}
                    onChange={(e) => setRequestFormData({...requestFormData, author: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">ISBN (Optional)</label>
                  <input
                    type="text"
                    value={requestFormData.isbn}
                    onChange={(e) => setRequestFormData({...requestFormData, isbn: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={requestFormData.category}
                    onChange={(e) => setRequestFormData({...requestFormData, category: e.target.value as any})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Finance Management">Finance Management</option>
                    <option value="Engineering">Engineering</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Published Year</label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={requestFormData.publishedYear}
                    onChange={(e) => setRequestFormData({...requestFormData, publishedYear: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                  <select
                    value={requestFormData.priority}
                    onChange={(e) => setRequestFormData({...requestFormData, priority: e.target.value as any})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Estimated Cost ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={requestFormData.estimatedCost}
                    onChange={(e) => setRequestFormData({...requestFormData, estimatedCost: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Publisher (Optional)</label>
                <input
                  type="text"
                  value={requestFormData.publisher}
                  onChange={(e) => setRequestFormData({...requestFormData, publisher: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Reason for Request</label>
                <textarea
                  value={requestFormData.reason}
                  onChange={(e) => setRequestFormData({...requestFormData, reason: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Explain why this book would be valuable for the library collection..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-6 py-3 text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-all duration-200"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

{showSharedView && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
    <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-xl text-white relative">
      <button
        onClick={() => setShowSharedView(null)}
        className="absolute top-2 right-2 text-gray-400 hover:text-white"
      >
        ✕
      </button>

      {requests
        .filter((r) => r.id === showSharedView)
        .map((request) => (
          <div key={request.id}>
            <h2 className="text-2xl font-bold mb-2">{request.title}</h2>
            <p className="text-gray-300 mb-2">Author: {request.author}</p>
            <p className="text-sm text-gray-400 mb-4">Supporters: {request.supportCount}</p>

            <button
              onClick={() => {
                const updatedRequests = [...requests];
                const index = updatedRequests.findIndex((r) => r.id === request.id);
                if (index !== -1) {
                  updatedRequests[index].supportCount += 1;
                  setRequests(updatedRequests);
                }
              }}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-xl text-white font-medium"
            >
              Support Request
            </button>
          </div>
        ))}
    </div>
  </div>
)}

    </div>
  );
};

export default BookRequests;