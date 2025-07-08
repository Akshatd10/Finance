const API_BASE_URL = 'http://localhost:5000/api';

// API utility functions
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'Something went wrong');
  }
  
  return response.json();
};

// Authentication API
export const authAPI = {
  login: async (email: string, password: string) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
    studentId?: string;
    department?: string;
    phone?: string;
    dateOfBirth?: string;
  }) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getProfile: async () => {
    return apiRequest('/auth/profile');
  },

  updateProfile: async (userData: any) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
};

// Books API
export const booksAPI = {
  getBooks: async (params?: {
    search?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return apiRequest(`/books?${queryParams.toString()}`);
  },

  getBook: async (id: string) => {
    return apiRequest(`/books/${id}`);
  },

  addBook: async (bookData: any) => {
    return apiRequest('/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    });
  },

  updateBook: async (id: string, bookData: any) => {
    return apiRequest(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookData),
    });
  },

  deleteBook: async (id: string) => {
    return apiRequest(`/books/${id}`, {
      method: 'DELETE',
    });
  },
};

// Transactions API
export const transactionsAPI = {
  getTransactions: async (params?: { status?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return apiRequest(`/transactions?${queryParams.toString()}`);
  },

  issueBook: async (bookId: string, memberId: string) => {
    return apiRequest('/transactions/issue', {
      method: 'POST',
      body: JSON.stringify({ bookId, memberId }),
    });
  },

  returnBook: async (transactionId: string) => {
    return apiRequest(`/transactions/${transactionId}/return`, {
      method: 'PUT',
    });
  },

  renewBook: async (transactionId: string) => {
    return apiRequest(`/transactions/${transactionId}/renew`, {
      method: 'PUT',
    });
  },
};

// Reservations API
export const reservationsAPI = {
  getReservations: async (params?: { status?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return apiRequest(`/reservations?${queryParams.toString()}`);
  },

  createReservation: async (bookId: string, days?: number) => {
    return apiRequest('/reservations', {
      method: 'POST',
      body: JSON.stringify({ bookId, days }),
    });
  },

  cancelReservation: async (reservationId: string) => {
    return apiRequest(`/reservations/${reservationId}/cancel`, {
      method: 'PUT',
    });
  },

  fulfillReservation: async (reservationId: string) => {
    return apiRequest(`/reservations/${reservationId}/fulfill`, {
      method: 'PUT',
    });
  },
};

// Members API
export const membersAPI = {
  getMembers: async (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return apiRequest(`/members?${queryParams.toString()}`);
  },

  updateMemberStatus: async (memberId: string, status: string) => {
    return apiRequest(`/members/${memberId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

// Donations API
export const donationsAPI = {
  submitDonation: async (donationData: any) => {
    return apiRequest('/donations', {
      method: 'POST',
      body: JSON.stringify(donationData),
    });
  },

  getMyDonations: async () => {
    return apiRequest('/donations/my-donations');
  },

  getAllDonations: async (params?: { status?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return apiRequest(`/donations?${queryParams.toString()}`);
  },

  reviewDonation: async (donationId: string, status: string, reviewNotes: string) => {
    return apiRequest(`/donations/${donationId}/review`, {
      method: 'PUT',
      body: JSON.stringify({ status, reviewNotes }),
    });
  },

  addToInventory: async (donationId: string) => {
    return apiRequest(`/donations/${donationId}/add-to-inventory`, {
      method: 'POST',
    });
  },
};

// Requests API
export const requestsAPI = {
  submitRequest: async (requestData: any) => {
    return apiRequest('/requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  getMyRequests: async () => {
    return apiRequest('/requests/my-requests');
  },

  getAllRequests: async (params?: { status?: string; priority?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return apiRequest(`/requests?${queryParams.toString()}`);
  },

  supportRequest: async (requestId: string) => {
    return apiRequest(`/requests/${requestId}/support`, {
      method: 'POST',
    });
  },

  reviewRequest: async (requestId: string, data: any) => {
    return apiRequest(`/requests/${requestId}/review`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  markReceived: async (requestId: string, totalCopies?: number) => {
    return apiRequest(`/requests/${requestId}/received`, {
      method: 'POST',
      body: JSON.stringify({ totalCopies }),
    });
  },
};

// Plagiarism Checker API
export const plagiarismAPI = {
  checkDocument: async (file: File) => {
    const formData = new FormData();
    formData.append('document', file);
    
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/plagiarism/check`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Something went wrong');
    }
    
    return response.json();
  },

  getResults: async (params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return apiRequest(`/plagiarism/results?${queryParams.toString()}`);
  },

  getResult: async (resultId: string) => {
    return apiRequest(`/plagiarism/results/${resultId}`);
  },

  downloadReport: async (resultId: string) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/plagiarism/results/${resultId}/download`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to download report');
    }
    
    return response.blob();
  },
};

// Notifications API
export const notificationsAPI = {
  getNotifications: async (params?: { page?: number; limit?: number; unreadOnly?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.unreadOnly) queryParams.append('unreadOnly', 'true');
    
    return apiRequest(`/notifications?${queryParams.toString()}`);
  },

  markAsRead: async (notificationId: string) => {
    return apiRequest(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },

  markAllAsRead: async () => {
    return apiRequest('/notifications/mark-all-read', {
      method: 'PUT',
    });
  },

  deleteNotification: async (notificationId: string) => {
    return apiRequest(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  },
};