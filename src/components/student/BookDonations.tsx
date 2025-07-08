import React, { useState } from 'react';
import { Gift, Plus, BookOpen, Clock, CheckCircle, X, AlertCircle } from 'lucide-react';

const BookDonations = () => {
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [donationFormData, setDonationFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Computer Science' as const,
    condition: 'good' as const,
    publishedYear: new Date().getFullYear(),
    description: '',
    estimatedValue: ''
  });

  // Mock data for demonstration
  const donations = [
    {
      id: '1',
      title: 'Advanced React Patterns',
      author: 'John Doe',
      category: 'Computer Science',
      condition: 'excellent',
      status: 'approved',
      submittedDate: '2024-01-15',
      reviewDate: '2024-01-18',
      reviewNotes: 'Great addition to our collection!'
    },
    {
      id: '2',
      title: 'Financial Markets Analysis',
      author: 'Jane Smith',
      category: 'Finance Management',
      condition: 'good',
      status: 'pending',
      submittedDate: '2024-01-20'
    }
  ];

  const handleSubmitDonation = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Donation submitted:', donationFormData);
    setShowDonationModal(false);
    setDonationFormData({
      title: '',
      author: '',
      isbn: '',
      category: 'Computer Science',
      condition: 'good',
      publishedYear: new Date().getFullYear(),
      description: '',
      estimatedValue: ''
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-400" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case 'rejected':
        return <X className="h-5 w-5 text-red-400" />;
      case 'processed':
        return <BookOpen className="h-5 w-5 text-blue-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'approved':
        return 'bg-emerald-500/20 text-emerald-300';
      case 'rejected':
        return 'bg-red-500/20 text-red-300';
      case 'processed':
        return 'bg-blue-500/20 text-blue-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Book Donations</h1>
          <p className="text-gray-300">Donate books to help expand our library collection</p>
        </div>
        <button
          onClick={() => setShowDonationModal(true)}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="h-5 w-5 mr-2" />
          Donate a Book
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-xl p-6 border border-emerald-500/20">
        <div className="flex items-start space-x-4">
          <Gift className="h-8 w-8 text-emerald-400 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Why Donate Books?</h3>
            <ul className="text-gray-300 space-y-1 text-sm">
              <li>• Help fellow students access more learning resources</li>
              <li>• Contribute to the growth of our library collection</li>
              <li>• Give your books a second life instead of letting them collect dust</li>
              <li>• Support the academic community</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Donations List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">My Donations</h2>
        
        {donations.length > 0 ? (
          donations.map((donation) => (
            <div key={donation.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{donation.title}</h3>
                      <p className="text-gray-300 text-sm">by {donation.author}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(donation.status)}
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(donation.status)}`}>
                        {donation.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Category:</span>
                      <p className="text-white">{donation.category}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Condition:</span>
                      <p className="text-white capitalize">{donation.condition}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Submitted:</span>
                      <p className="text-white">{donation.submittedDate}</p>
                    </div>
                    {donation.reviewDate && (
                      <div>
                        <span className="text-gray-400">Reviewed:</span>
                        <p className="text-white">{donation.reviewDate}</p>
                      </div>
                    )}
                  </div>

                  {donation.reviewNotes && (
                    <div className="mt-3 p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-400 text-sm">Review Notes:</span>
                      <p className="text-white text-sm mt-1">{donation.reviewNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No donations yet</h3>
            <p className="text-gray-400">Start by donating your first book to help expand our collection!</p>
          </div>
        )}
      </div>

      {/* Donation Modal */}
      {showDonationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Donate a Book</h2>
            
            <form onSubmit={handleSubmitDonation} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Book Title</label>
                  <input
                    type="text"
                    value={donationFormData.title}
                    onChange={(e) => setDonationFormData({...donationFormData, title: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Author</label>
                  <input
                    type="text"
                    value={donationFormData.author}
                    onChange={(e) => setDonationFormData({...donationFormData, author: e.target.value})}
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
                    value={donationFormData.isbn}
                    onChange={(e) => setDonationFormData({...donationFormData, isbn: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={donationFormData.category}
                    onChange={(e) => setDonationFormData({...donationFormData, category: e.target.value as any})}
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">Condition</label>
                  <select
                    value={donationFormData.condition}
                    onChange={(e) => setDonationFormData({...donationFormData, condition: e.target.value as any})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Published Year</label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={donationFormData.publishedYear}
                    onChange={(e) => setDonationFormData({...donationFormData, publishedYear: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Estimated Value ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={donationFormData.estimatedValue}
                    onChange={(e) => setDonationFormData({...donationFormData, estimatedValue: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={donationFormData.description}
                  onChange={(e) => setDonationFormData({...donationFormData, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Brief description of the book's condition and any additional notes..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowDonationModal(false)}
                  className="px-6 py-3 text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-all duration-200"
                >
                  Submit Donation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDonations;