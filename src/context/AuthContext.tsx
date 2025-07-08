import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/app';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'student';
  studentId?: string;
  department?: string;
  phone?: string;
  totalBorrowed?: number;
  currentBorrowed?: number;
  totalFines?: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await authAPI.getProfile();
          setUser({
            id: response.user._id,
            email: response.user.email,
            name: response.user.name,
            role: response.user.role,
            studentId: response.user.studentId,
            department: response.user.department,
            phone: response.user.phone,
            totalBorrowed: response.user.totalBorrowed,
            currentBorrowed: response.user.currentBorrowed,
            totalFines: response.user.totalFines,
          });
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('authToken');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      
      // Store token
      localStorage.setItem('authToken', response.token);
      
      // Set user data
      setUser({
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role,
        studentId: response.user.studentId,
        department: response.user.department,
        totalBorrowed: response.user.totalBorrowed,
        currentBorrowed: response.user.currentBorrowed,
        totalFines: response.user.totalFines,
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await authAPI.register(userData);
      
      // Store token
      localStorage.setItem('authToken', response.token);
      
      // Set user data
      setUser({
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role,
        studentId: response.user.studentId,
        department: response.user.department,
      });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isLoading,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};