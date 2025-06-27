/**
 * Phase 4: Mobile API Service - Backend Integration
 * RenX Neural Trading Platform
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Global __DEV__ declaration
declare var __DEV__: boolean;

// API Configuration
const API_CONFIG = {
  BASE_URL: __DEV__ ? 'http://localhost:3344' : 'https://api.renx.ai',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
};

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

class ApiService {
  private static instance: ApiService;
  private authTokens: AuthTokens | null = null;
  private cache: Map<string, any> = new Map();

  private constructor() {
    this.loadAuthTokens();
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Authentication Management
  private async loadAuthTokens(): Promise<void> {
    try {
      const tokensJson = await SecureStore.getItemAsync('authTokens');
      if (tokensJson) {
        this.authTokens = JSON.parse(tokensJson);
      }
    } catch (error) {
      console.error('Failed to load auth tokens:', error);
    }
  }

  private async saveAuthTokens(tokens: AuthTokens): Promise<void> {
    try {
      this.authTokens = tokens;
      await SecureStore.setItemAsync('authTokens', JSON.stringify(tokens));
    } catch (error) {
      console.error('Failed to save auth tokens:', error);
    }
  }

  private isTokenExpired(): boolean {
    if (!this.authTokens) return true;
    return Date.now() >= this.authTokens.expiresAt - 5 * 60 * 1000;
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      if (!this.authTokens?.refreshToken) return false;

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.authTokens.refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      const newTokens: AuthTokens = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: Date.now() + (data.expiresIn * 1000),
      };

      await this.saveAuthTokens(newTokens);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // HTTP Request Handler
  private async makeRequest<T>(
    endpoint: string,
    method: string = 'GET',
    data?: any,
    useAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    try {
      // Refresh token if needed
      if (useAuth && this.isTokenExpired()) {
        await this.refreshAccessToken();
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (useAuth && this.authTokens) {
        headers.Authorization = `Bearer ${this.authTokens.accessToken}`;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      return {
        success: false,
        data: {} as T,
        error: (error as Error).message,
      };
    }
  }

  // Authentication APIs
  public async login(email: string, password: string, tenantId: string): Promise<ApiResponse<AuthTokens>> {
    const response = await this.makeRequest<AuthTokens>('/api/auth/login', 'POST', 
      { email, password, tenantId }, false);
    
    if (response.success && response.data) {
      await this.saveAuthTokens(response.data);
    }
    return response;
  }

  public async logout(): Promise<ApiResponse<void>> {
    await this.makeRequest('/api/auth/logout', 'POST');
    await SecureStore.deleteItemAsync('authTokens');
    this.authTokens = null;
    return { success: true, data: undefined };
  }

  // Dashboard APIs
  public async getDashboardData(): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/dashboard');
  }

  public async getPortfolioSummary(): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/portfolio/summary');
  }

  // Market Data APIs
  public async getMarketData(symbols: string[]): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/market/data', 'POST', { symbols });
  }

  public async getMarketTrends(): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/market/trends');
  }

  // Trading APIs
  public async placeOrder(orderData: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/trading/orders', 'POST', orderData);
  }

  public async getTradeHistory(limit: number = 50): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/trading/history?limit=${limit}`);
  }

  public async getOpenOrders(): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/trading/orders/open');
  }

  // AI Signals APIs
  public async getAISignals(): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/ai/signals');
  }

  public async getAIPredictions(symbol: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/ai/predictions/${symbol}`);
  }

  // Portfolio APIs
  public async getPortfolioPositions(): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/portfolio/positions');
  }

  public async getPortfolioPerformance(period: string = '1M'): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/portfolio/performance?period=${period}`);
  }

  // Watchlist APIs
  public async getWatchlists(): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/watchlist');
  }

  public async addToWatchlist(symbol: string, watchlistId?: string): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/watchlist/symbols', 'POST', { symbol, watchlistId });
  }

  // Utility Methods
  public isAuthenticated(): boolean {
    return this.authTokens !== null && !this.isTokenExpired();
  }

  public async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export default ApiService.getInstance(); 