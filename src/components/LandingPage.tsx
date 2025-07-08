import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, TrendingUp, Shield, Clock, Award } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-emerald-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              LibraryPro
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="px-4 py-2 text-white hover:text-emerald-400 transition-colors duration-200"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105"
            >
              Sign Up
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white via-emerald-200 to-blue-200 bg-clip-text text-transparent">
            Modern Library
            <br />
            Management System
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Streamline your library operations with our comprehensive management platform featuring advanced book tracking, member management, and automated fine calculations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl text-lg font-semibold hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 shadow-xl"
            >
              Get Started Today
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 border-2 border-white/20 rounded-xl text-lg font-semibold hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
            >
              Access Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
            Powerful Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="h-8 w-8" />,
                title: "Member Management",
                description: "Comprehensive member profiles with borrowing history and automated notifications"
              },
              {
                icon: <BookOpen className="h-8 w-8" />,
                title: "Book Catalog",
                description: "Extensive collection management with CS Engineering and Finance titles"
              },
              {
                icon: <TrendingUp className="h-8 w-8" />,
                title: "Transaction Tracking",
                description: "Real-time tracking of book issues, returns, and reservation status"
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Role-Based Access",
                description: "Secure admin and student portals with appropriate permissions"
              },
              {
                icon: <Clock className="h-8 w-8" />,
                title: "Automated Fines",
                description: "Smart fine calculation system for overdue books with flexible policies"
              },
              {
                icon: <Award className="h-8 w-8" />,
                title: "Advanced Reservations",
                description: "Book reservation system with date-specific booking capabilities"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="text-emerald-400 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">Ready to Transform Your Library?</h2>
          <p className="text-xl text-gray-300 mb-12">
            Join thousands of libraries already using LibraryPro to streamline their operations
          </p>
          <Link
            to="/signup"
            className="inline-block px-10 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl text-lg font-semibold hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 shadow-2xl"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BookOpen className="h-6 w-6 text-emerald-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              LibraryPro
            </span>
          </div>
          <p>&copy; 2025 LibraryPro. All rights reserved. Empowering libraries worldwide.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;