import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: 'Computer Science' | 'Finance Management' | 'Engineering' | 'General';
  totalCopies: number;
  availableCopies: number;
  publishedYear: number;
  description: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  studentId?: string;
  department?: string;
  phone: string;
  joinDate: string;
  status: 'active' | 'suspended';
  totalBorrowed: number;
  currentBorrowed: number;
  totalFines: number;
}

interface Transaction {
  id: string;
  bookId: string;
  memberId: string;
  type: 'issue' | 'return' | 'reservation';
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fine: number;
  status: 'active' | 'returned' | 'overdue';
}

interface Reservation {
  id: string;
  bookId: string;
  memberId: string;
  reservationDate: string;
  expiryDate: string;
  status: 'active' | 'fulfilled' | 'expired' | 'cancelled';
}

interface LibraryContextType {
  books: Book[];
  members: Member[];
  transactions: Transaction[];
  reservations: Reservation[];
  addBook: (book: Omit<Book, 'id'>) => void;
  addMember: (member: Omit<Member, 'id' | 'joinDate' | 'totalBorrowed' | 'currentBorrowed' | 'totalFines'>) => void;
  issueBook: (bookId: string, memberId: string) => void;
  returnBook: (transactionId: string) => void;
  reserveBook: (bookId: string, memberId: string, days: number) => void;
  cancelReservation: (reservationId: string) => void;
  calculateFine: (dueDate: string, returnDate?: string) => number;
  getOverdueTransactions: () => Transaction[];
}

// Sample data
const initialBooks: Book[] = [
  // Computer Science Books
  {
    id: '1',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    category: 'Computer Science',
    totalCopies: 5,
    availableCopies: 3,
    publishedYear: 2008,
    description: 'A guide to writing clean, maintainable code.'
  },
  {
    id: '2',
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    isbn: '978-0262033848',
    category: 'Computer Science',
    totalCopies: 8,
    availableCopies: 6,
    publishedYear: 2009,
    description: 'Comprehensive guide to algorithms and data structures.'
  },
  {
    id: '3',
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    author: 'Gang of Four',
    isbn: '978-0201633612',
    category: 'Computer Science',
    totalCopies: 4,
    availableCopies: 2,
    publishedYear: 1994,
    description: 'Classic book on software design patterns.'
  },
  {
    id: '4',
    title: 'JavaScript: The Good Parts',
    author: 'Douglas Crockford',
    isbn: '978-0596517748',
    category: 'Computer Science',
    totalCopies: 6,
    availableCopies: 4,
    publishedYear: 2008,
    description: 'Essential JavaScript programming concepts.'
  },
  {
    id: '5',
    title: 'System Design Interview',
    author: 'Alex Xu',
    isbn: '978-1736049129',
    category: 'Computer Science',
    totalCopies: 3,
    availableCopies: 1,
    publishedYear: 2020,
    description: 'Comprehensive guide to system design interviews.'
  },
  // Finance Management Books
  {
    id: '6',
    title: 'Financial Management: Theory & Practice',
    author: 'Eugene F. Brigham',
    isbn: '978-1337902601',
    category: 'Finance Management',
    totalCopies: 7,
    availableCopies: 5,
    publishedYear: 2019,
    description: 'Comprehensive corporate finance textbook.'
  },
  {
    id: '7',
    title: 'The Intelligent Investor',
    author: 'Benjamin Graham',
    isbn: '978-0060555665',
    category: 'Finance Management',
    totalCopies: 5,
    availableCopies: 3,
    publishedYear: 2003,
    description: 'Classic value investing guide.'
  },
  {
    id: '8',
    title: 'Corporate Finance',
    author: 'Ross, Westerfield, Jaffe',
    isbn: '978-1259918940',
    category: 'Finance Management',
    totalCopies: 6,
    availableCopies: 4,
    publishedYear: 2019,
    description: 'Advanced corporate finance concepts.'
  },
  {
    id: '9',
    title: 'Investment Analysis and Portfolio Management',
    author: 'Frank K. Reilly',
    isbn: '978-1305262997',
    category: 'Finance Management',
    totalCopies: 4,
    availableCopies: 2,
    publishedYear: 2018,
    description: 'Portfolio management and investment strategies.'
  },
  {
    id: '10',
    title: 'Principles of Risk Management and Insurance',
    author: 'George E. Rejda',
    isbn: '978-0134082578',
    category: 'Finance Management',
    totalCopies: 3,
    availableCopies: 3,
    publishedYear: 2017,
    description: 'Risk management principles and insurance concepts.'
  }
];

const initialMembers: Member[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@student.edu',
    studentId: 'CS2023001',
    department: 'Computer Science',
    phone: '+1-555-0101',
    joinDate: '2023-09-01',
    status: 'active',
    totalBorrowed: 15,
    currentBorrowed: 2,
    totalFines: 12.50
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@student.edu',
    studentId: 'FN2023002',
    department: 'Finance',
    phone: '+1-555-0102',
    joinDate: '2023-09-01',
    status: 'active',
    totalBorrowed: 10,
    currentBorrowed: 1,
    totalFines: 8.00
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike.wilson@student.edu',
    studentId: 'EN2023003',
    department: 'Engineering',
    phone: '+1-555-0103',
    joinDate: '2023-08-15',
    status: 'active',
    totalBorrowed: 8,
    currentBorrowed: 3,
    totalFines: 0
  }
];

// Get current date for realistic overdue calculations
const getCurrentDate = () => new Date().toISOString().split('T')[0];
const getDateDaysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};
const getDateDaysFromNow = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

// Sample transactions with realistic dates to demonstrate fine system
const initialTransactions: Transaction[] = [
  // John's transactions
  {
    id: 'txn1',
    bookId: '1',
    memberId: '1',
    type: 'issue',
    issueDate: getDateDaysAgo(10),
    dueDate: getDateDaysFromNow(4), // Due in 4 days - not overdue
    fine: 0,
    status: 'active'
  },
  {
    id: 'txn2',
    bookId: '2',
    memberId: '1',
    type: 'issue',
    issueDate: getDateDaysAgo(20),
    dueDate: getDateDaysAgo(6), // 6 days overdue
    fine: 0,
    status: 'active'
  },
  {
    id: 'txn3',
    bookId: '3',
    memberId: '1',
    type: 'issue',
    issueDate: getDateDaysAgo(30),
    dueDate: getDateDaysAgo(16),
    returnDate: getDateDaysAgo(10), // Returned 6 days late
    fine: 3.00, // 6 days * $0.50
    status: 'returned'
  },
  {
    id: 'txn4',
    bookId: '4',
    memberId: '1',
    type: 'issue',
    issueDate: getDateDaysAgo(45),
    dueDate: getDateDaysAgo(31),
    returnDate: getDateDaysAgo(12), // Returned 19 days late
    fine: 9.50, // 19 days * $0.50
    status: 'returned'
  },
  
  // Sarah's transactions
  {
    id: 'txn5',
    bookId: '6',
    memberId: '2',
    type: 'issue',
    issueDate: getDateDaysAgo(8),
    dueDate: getDateDaysFromNow(6), // Due in 6 days - not overdue
    fine: 0,
    status: 'active'
  },
  {
    id: 'txn6',
    bookId: '7',
    memberId: '2',
    type: 'issue',
    issueDate: getDateDaysAgo(25),
    dueDate: getDateDaysAgo(11),
    returnDate: getDateDaysAgo(5), // Returned 6 days late
    fine: 3.00, // 6 days * $0.50
    status: 'returned'
  },
  {
    id: 'txn7',
    bookId: '8',
    memberId: '2',
    type: 'issue',
    issueDate: getDateDaysAgo(40),
    dueDate: getDateDaysAgo(26),
    returnDate: getDateDaysAgo(16), // Returned 10 days late
    fine: 5.00, // 10 days * $0.50
    status: 'returned'
  },
  
  // Mike's transactions (no fines)
  {
    id: 'txn8',
    bookId: '9',
    memberId: '3',
    type: 'issue',
    issueDate: getDateDaysAgo(5),
    dueDate: getDateDaysFromNow(9), // Due in 9 days
    fine: 0,
    status: 'active'
  },
  {
    id: 'txn9',
    bookId: '10',
    memberId: '3',
    type: 'issue',
    issueDate: getDateDaysAgo(3),
    dueDate: getDateDaysFromNow(11), // Due in 11 days
    fine: 0,
    status: 'active'
  },
  {
    id: 'txn10',
    bookId: '5',
    memberId: '3',
    type: 'issue',
    issueDate: getDateDaysAgo(1),
    dueDate: getDateDaysFromNow(13), // Due in 13 days
    fine: 0,
    status: 'active'
  }
];

// Sample reservations
const initialReservations: Reservation[] = [
  {
    id: 'res1',
    bookId: '1',
    memberId: '2',
    reservationDate: getDateDaysAgo(2),
    expiryDate: getDateDaysFromNow(5),
    status: 'active'
  },
  {
    id: 'res2',
    bookId: '4',
    memberId: '3',
    reservationDate: getDateDaysAgo(1),
    expiryDate: getDateDaysFromNow(6),
    status: 'active'
  },
  {
    id: 'res3',
    bookId: '6',
    memberId: '1',
    reservationDate: getDateDaysAgo(10),
    expiryDate: getDateDaysAgo(3), // Expired 3 days ago
    status: 'active'
  },
  {
    id: 'res4',
    bookId: '7',
    memberId: '2',
    reservationDate: getDateDaysAgo(15),
    expiryDate: getDateDaysAgo(8),
    status: 'cancelled'
  }
];

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider = ({ children }: { children: ReactNode }) => {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);

  const addBook = (bookData: Omit<Book, 'id'>) => {
    const newBook: Book = {
      ...bookData,
      id: Math.random().toString(36).substr(2, 9),
    };
    setBooks(prev => [...prev, newBook]);
  };

  const addMember = (memberData: Omit<Member, 'id' | 'joinDate' | 'totalBorrowed' | 'currentBorrowed' | 'totalFines'>) => {
    const newMember: Member = {
      ...memberData,
      id: Math.random().toString(36).substr(2, 9),
      joinDate: new Date().toISOString().split('T')[0],
      totalBorrowed: 0,
      currentBorrowed: 0,
      totalFines: 0,
    };
    setMembers(prev => [...prev, newMember]);
  };

  const issueBook = (bookId: string, memberId: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book || book.availableCopies <= 0) return;

    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 2 weeks

    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      bookId,
      memberId,
      type: 'issue',
      issueDate: issueDate.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      fine: 0,
      status: 'active'
    };

    setTransactions(prev => [...prev, transaction]);
    setBooks(prev => prev.map(b => 
      b.id === bookId 
        ? { ...b, availableCopies: b.availableCopies - 1 }
        : b
    ));
    setMembers(prev => prev.map(m =>
      m.id === memberId
        ? { ...m, currentBorrowed: m.currentBorrowed + 1, totalBorrowed: m.totalBorrowed + 1 }
        : m
    ));
  };

  const returnBook = (transactionId: string) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    const returnDate = new Date().toISOString().split('T')[0];
    const fine = calculateFine(transaction.dueDate, returnDate);

    setTransactions(prev => prev.map(t =>
      t.id === transactionId
        ? { ...t, returnDate, fine, status: 'returned' as const }
        : t
    ));

    setBooks(prev => prev.map(b =>
      b.id === transaction.bookId
        ? { ...b, availableCopies: b.availableCopies + 1 }
        : b
    ));

    setMembers(prev => prev.map(m =>
      m.id === transaction.memberId
        ? { 
            ...m, 
            currentBorrowed: Math.max(0, m.currentBorrowed - 1),
            totalFines: m.totalFines + fine
          }
        : m
    ));
  };

  const reserveBook = (bookId: string, memberId: string, days: number) => {
    const reservationDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    const reservation: Reservation = {
      id: Math.random().toString(36).substr(2, 9),
      bookId,
      memberId,
      reservationDate: reservationDate.toISOString().split('T')[0],
      expiryDate: expiryDate.toISOString().split('T')[0],
      status: 'active'
    };

    setReservations(prev => [...prev, reservation]);
  };

  const cancelReservation = (reservationId: string) => {
    setReservations(prev => prev.map(r =>
      r.id === reservationId
        ? { ...r, status: 'cancelled' as const }
        : r
    ));
  };

  const calculateFine = (dueDate: string, returnDate?: string): number => {
    const due = new Date(dueDate);
    const returned = returnDate ? new Date(returnDate) : new Date();
    
    if (returned <= due) return 0;
    
    const daysOverdue = Math.ceil((returned.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysOverdue * 0.50); // $0.50 per day, minimum 0
  };

  const getOverdueTransactions = (): Transaction[] => {
    const today = new Date();
    return transactions.filter(t => {
      if (t.status !== 'active') return false;
      const dueDate = new Date(t.dueDate);
      return dueDate < today;
    });
  };

  const value = {
    books,
    members,
    transactions,
    reservations,
    addBook,
    addMember,
    issueBook,
    returnBook,
    reserveBook,
    cancelReservation,
    calculateFine,
    getOverdueTransactions,
  };

  return (
    <LibraryContext.Provider value={value}>
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};