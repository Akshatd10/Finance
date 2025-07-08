import React, { useState } from 'react';
import { BookOpen, Search, Filter, Calendar, User, Star } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';

const BookCatalog = () => {
  const { books, reserveBook } = useLibrary();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('title');

  const filteredAndSortedBooks = books
    .filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           book.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'year':
          return b.publishedYear - a.publishedYear;
        case 'availability':
          return b.availableCopies - a.availableCopies;
        default:
          return 0;
      }
    });

  const handleReserveBook = (bookId: string) => {
    if (user) {
      reserveBook(bookId, user.id, 7); // Reserve for 7 days
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Book Catalog</h1>
        <p className="text-gray-300">Discover and reserve books from our collection</p>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search books, authors, or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Categories</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Finance Management">Finance Management</option>
          <option value="Engineering">Engineering</option>
          <option value="General">General</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="title">Sort by Title</option>
          <option value="author">Sort by Author</option>
          <option value="year">Sort by Year</option>
          <option value="availability">Sort by Availability</option>
        </select>
      </div>

      {/* Results Count */}
      <div className="text-gray-300">
        Showing {filteredAndSortedBooks.length} of {books.length} books
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedBooks.map((book) => (
          <div key={book.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200 transform hover:-translate-y-1">
            {/* Book Header */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{book.title}</h3>
              <p className="text-gray-300 text-sm mb-1">by {book.author}</p>
              <p className="text-gray-400 text-xs">Published: {book.publishedYear}</p>
            </div>

            {/* Category Badge */}
            <div className="mb-4">
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                book.category === 'Computer Science' ? 'bg-blue-500/20 text-blue-300' :
                book.category === 'Finance Management' ? 'bg-emerald-500/20 text-emerald-300' :
                book.category === 'Engineering' ? 'bg-purple-500/20 text-purple-300' :
                'bg-gray-500/20 text-gray-300'
              }`}>
                {book.category}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-sm mb-4 line-clamp-3">{book.description}</p>

            {/* Availability */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-sm">
                <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-gray-300">
                  {book.availableCopies} of {book.totalCopies} available
                </span>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                book.availableCopies > 0 ? 'bg-emerald-400' : 'bg-red-400'
              }`} />
            </div>

            {/* ISBN */}
            <div className="text-xs text-gray-400 mb-4">
              ISBN: {book.isbn}
            </div>

            {/* Action Button */}
            <button
              onClick={() => handleReserveBook(book.id)}
              disabled={book.availableCopies === 0}
              className={`w-full py-3 rounded-xl font-medium transition-all duration-200 ${
                book.availableCopies > 0
                  ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:from-emerald-600 hover:to-blue-600 transform hover:scale-105'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {book.availableCopies > 0 ? (
                <span className="flex items-center justify-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Reserve Book
                </span>
              ) : (
                'Currently Unavailable'
              )}
            </button>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredAndSortedBooks.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No books found</h3>
          <p className="text-gray-400">Try adjusting your search criteria or browse different categories.</p>
        </div>
      )}
    </div>
  );
};

export default BookCatalog;