// Mock API service for development without a backend
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate localStorage-based user storage
const mockUsers = {
  getUsers: () => {
    try {
      const users = JSON.parse(localStorage.getItem('renx_users')) || [];
      
      // Create a demo user if no users exist
      if (users.length === 0) {
        const demoUser = {
          id: 'demo-user-123',
          username: 'demo',
          name: 'Demo User',
          email: 'demo@example.com',
          password: 'password123',
          phone: '+1 555-123-4567',
          location: 'New York, USA',
          bio: 'I am a trader using RenX platform.',
          balance: 10000,
          role: 'user',
          createdAt: new Date().toISOString()
        };
        users.push(demoUser);
        localStorage.setItem('renx_users', JSON.stringify(users));
      }
      
      return users;
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  },
  
  saveUsers: (users) => {
    localStorage.setItem('renx_users', JSON.stringify(users));
  },
  
  findUserByEmail: (email) => {
    const users = mockUsers.getUsers();
    return users.find(user => user.email === email);
  },
  
  addUser: (user) => {
    const users = mockUsers.getUsers();
    
    // Check if user already exists
    if (users.some(u => u.email === user.email)) {
      throw new Error('User with this email already exists');
    }
    
    if (users.some(u => u.username === user.username)) {
      throw new Error('Username is already taken');
    }
    
    const newUser = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      balance: 10000, // Starting balance
      role: 'user'
    };
    
    users.push(newUser);
    mockUsers.saveUsers(users);
    return newUser;
  }
};

// Auth mock API
export const mockAuthAPI = {
  register: async (userData) => {
    await delay(800); // Simulate network delay
    
    try {
      const newUser = mockUsers.addUser(userData);
      return { 
        data: { 
          success: true,
          user: { ...newUser, password: undefined } // Don't return password
        } 
      };
    } catch (error) {
      const errorResponse = {
        response: {
          data: {
            message: error.message
          }
        }
      };
      throw errorResponse;
    }
  },
  
  login: async (credentials) => {
    await delay(800); // Simulate network delay
    
    const user = mockUsers.findUserByEmail(credentials.email);
    
    if (!user || user.password !== credentials.password) {
      const errorResponse = {
        response: {
          data: {
            message: 'Invalid email or password'
          }
        }
      };
      throw errorResponse;
    }
    
    // Generate a simple mock token
    const token = `mock-token-${user.id}-${Date.now()}`;
    
    // Store current user id in localStorage
    localStorage.setItem('renx_current_user_id', user.id);
    
    return {
      data: {
        success: true,
        user: { ...user, password: undefined },
        token
      }
    };
  },
  
  logout: async () => {
    await delay(300);
    localStorage.removeItem('renx_current_user_id');
    return { data: { success: true } };
  },
  
  getProfile: async () => {
    await delay(500);
    
    const userId = localStorage.getItem('renx_current_user_id');
    
    if (!userId) {
      const errorResponse = {
        response: {
          status: 401,
          data: {
            message: 'Not authenticated'
          }
        }
      };
      throw errorResponse;
    }
    
    const users = mockUsers.getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      const errorResponse = {
        response: {
          status: 404,
          data: {
            message: 'User not found'
          }
        }
      };
      throw errorResponse;
    }
    
    return {
      data: { ...user, password: undefined }
    };
  },
  
  updateProfile: async (userData) => {
    await delay(800);
    
    const userId = localStorage.getItem('renx_current_user_id');
    
    if (!userId) {
      const errorResponse = {
        response: {
          status: 401,
          data: {
            message: 'Not authenticated'
          }
        }
      };
      throw errorResponse;
    }
    
    const users = mockUsers.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      const errorResponse = {
        response: {
          status: 404,
          data: {
            message: 'User not found'
          }
        }
      };
      throw errorResponse;
    }
    
    // Update user data, but don't allow changing email or password through this endpoint
    users[userIndex] = {
      ...users[userIndex],
      ...userData,
      email: users[userIndex].email,
      password: users[userIndex].password
    };
    
    mockUsers.saveUsers(users);
    
    return {
      data: { ...users[userIndex], password: undefined }
    };
  },
  
  changePassword: async (passwordData) => {
    await delay(800);
    
    const userId = localStorage.getItem('renx_current_user_id');
    
    if (!userId) {
      const errorResponse = {
        response: {
          status: 401,
          data: {
            message: 'Not authenticated'
          }
        }
      };
      throw errorResponse;
    }
    
    const users = mockUsers.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      const errorResponse = {
        response: {
          status: 404,
          data: {
            message: 'User not found'
          }
        }
      };
      throw errorResponse;
    }
    
    if (users[userIndex].password !== passwordData.currentPassword) {
      const errorResponse = {
        response: {
          status: 400,
          data: {
            message: 'Current password is incorrect'
          }
        }
      };
      throw errorResponse;
    }
    
    users[userIndex].password = passwordData.newPassword;
    mockUsers.saveUsers(users);
    
    return {
      data: { success: true }
    };
  }
};

// Mock orders storage
const mockOrders = {
  getOrders: () => {
    try {
      return JSON.parse(localStorage.getItem('renx_orders')) || [];
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  },
  
  saveOrders: (orders) => {
    localStorage.setItem('renx_orders', JSON.stringify(orders));
  },
  
  getUserOrders: (userId) => {
    const orders = mockOrders.getOrders();
    return orders.filter(order => order.userId === userId);
  },
  
  addOrder: (order) => {
    const orders = mockOrders.getOrders();
    const newOrder = {
      ...order,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'open'
    };
    
    orders.push(newOrder);
    mockOrders.saveOrders(orders);
    return newOrder;
  },
  
  removeOrder: (orderId) => {
    const orders = mockOrders.getOrders();
    const filteredOrders = orders.filter(order => order.id !== orderId);
    mockOrders.saveOrders(filteredOrders);
  }
};

// Orderbook mock API
export const mockOrderbookAPI = {
  get: async (symbol) => {
    await delay(300);
    
    const orders = mockOrders.getOrders();
    
    // Filter by symbol and group by type
    const symbolOrders = orders.filter(order => order.symbol === symbol && order.status === 'open');
    
    const bids = symbolOrders
      .filter(order => order.side === 'buy')
      .sort((a, b) => b.price - a.price); // Descending price for buy orders
      
    const asks = symbolOrders
      .filter(order => order.side === 'sell')
      .sort((a, b) => a.price - b.price); // Ascending price for sell orders
    
    return {
      data: {
        symbol,
        bids,
        asks
      }
    };
  },
  
  placeOrder: async (orderData) => {
    await delay(500);
    
    const userId = localStorage.getItem('renx_current_user_id');
    
    if (!userId) {
      const errorResponse = {
        response: {
          status: 401,
          data: {
            message: 'Not authenticated'
          }
        }
      };
      throw errorResponse;
    }
    
    // Validate order data
    if (!orderData.symbol || !orderData.side || !orderData.amount) {
      const errorResponse = {
        response: {
          status: 400,
          data: {
            message: 'Missing required fields'
          }
        }
      };
      throw errorResponse;
    }
    
    if (orderData.side !== 'buy' && orderData.side !== 'sell') {
      const errorResponse = {
        response: {
          status: 400,
          data: {
            message: 'Invalid order side'
          }
        }
      };
      throw errorResponse;
    }
    
    // Get user
    const users = mockUsers.getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      const errorResponse = {
        response: {
          status: 404,
          data: {
            message: 'User not found'
          }
        }
      };
      throw errorResponse;
    }
    
    // Calculate order cost
    const cost = orderData.amount * orderData.price / (orderData.leverage || 1);
    
    // Check if user has enough balance (for buy orders)
    if (orderData.side === 'buy' && cost > user.balance) {
      const errorResponse = {
        response: {
          status: 400,
          data: {
            message: 'Insufficient balance'
          }
        }
      };
      throw errorResponse;
    }
    
    // Create new order
    const newOrder = mockOrders.addOrder({
      ...orderData,
      userId,
    });
    
    // Update user balance
    if (orderData.side === 'buy') {
      user.balance -= cost;
    }
    
    mockUsers.saveUsers(users);
    
    return {
      data: newOrder
    };
  },
  
  cancelOrder: async (orderId) => {
    await delay(400);
    
    const userId = localStorage.getItem('renx_current_user_id');
    
    if (!userId) {
      const errorResponse = {
        response: {
          status: 401,
          data: {
            message: 'Not authenticated'
          }
        }
      };
      throw errorResponse;
    }
    
    const orders = mockOrders.getOrders();
    const orderToCancel = orders.find(order => order.id === orderId);
    
    if (!orderToCancel) {
      const errorResponse = {
        response: {
          status: 404,
          data: {
            message: 'Order not found'
          }
        }
      };
      throw errorResponse;
    }
    
    if (orderToCancel.userId !== userId) {
      const errorResponse = {
        response: {
          status: 403,
          data: {
            message: 'Not authorized to cancel this order'
          }
        }
      };
      throw errorResponse;
    }
    
    // Return the funds to user balance if it's a buy order
    if (orderToCancel.side === 'buy') {
      const users = mockUsers.getUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex !== -1) {
        const cost = orderToCancel.amount * orderToCancel.price / (orderToCancel.leverage || 1);
        users[userIndex].balance += cost;
        mockUsers.saveUsers(users);
      }
    }
    
    mockOrders.removeOrder(orderId);
    
    return {
      data: {
        success: true,
        message: 'Order cancelled successfully'
      }
    };
  },
  
  getUserOrders: async () => {
    await delay(300);
    
    const userId = localStorage.getItem('renx_current_user_id');
    
    if (!userId) {
      const errorResponse = {
        response: {
          status: 401,
          data: {
            message: 'Not authenticated'
          }
        }
      };
      throw errorResponse;
    }
    
    const userOrders = mockOrders.getUserOrders(userId);
    
    return {
      data: userOrders
    };
  }
};

export default {
  authAPI: mockAuthAPI,
  orderbookAPI: mockOrderbookAPI
}; 