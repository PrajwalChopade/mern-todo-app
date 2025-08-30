import axios from 'axios';

const API_BASE = 'https://mern-todo-app-0f8z.onrender.com';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface SignInPayload {
  email: string;
  password: string;
  remember: boolean;
}

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    // Load token and user from localStorage OR sessionStorage on initialization
    this.token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    const userData = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user');
    if (userData) {
      try {
        this.user = JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        localStorage.removeItem('auth_user');
        sessionStorage.removeItem('auth_user');
      }
    }

    // Set up axios interceptor to include token in requests
    axios.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Set up response interceptor to handle token expiration
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          this.logout(); // Clear invalid token
        }
        return Promise.reject(error);
      }
    );
  }

  async signIn({ email, password, remember }: SignInPayload): Promise<User> {
    try {
      const response = await axios.post<AuthResponse>(`${API_BASE}/login`, {
        email,
        password
      });

      const { token, user } = response.data;
      this.setAuthData(token, user, remember);
      return user;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async signUp({ name, email, password }: SignUpPayload): Promise<User> {
    try {
      const response = await axios.post<AuthResponse>(`${API_BASE}/register`, {
        name,
        email,
        password
      });

      const { token, user } = response.data;
      this.setAuthData(token, user, true); // Always remember on signup
      return user;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  private setAuthData(token: string, user: User, remember: boolean) {
    this.token = token;
    this.user = user;

    if (remember) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      sessionStorage.setItem('auth_token', token);
      sessionStorage.setItem('auth_user', JSON.stringify(user));
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
  }

  getUser(): User | null {
    return this.user;
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  async validateToken(): Promise<boolean> {
    if (!this.token) {
      return false;
    }

    try {
      await axios.get(`${API_BASE}/validate-token`);
      return true;
    } catch (error: any) {
      // Check if it's a network error vs server rejection
      if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR' || !error.response) {
        // Network error - don't logout, server might be down temporarily
        throw error;
      }
      
      // Server explicitly rejected token (401, 403, etc.)
      if (error.response?.status === 401 || error.response?.status === 403) {
        this.logout();
        return false;
      }
      
      // Other server errors - don't logout
      throw error;
    }
  }
}

export const authService = new AuthService();
