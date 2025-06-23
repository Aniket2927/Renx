export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

export interface AISignal {
  id: string;
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  targetPrice?: number;
  stopLoss?: number;
  reasoning: string;
  createdAt: string;
}

export interface PortfolioUpdate {
  id: string;
  totalValue: number;
  availableCash: number;
  totalReturn: number;
  dailyPnL: number;
  positions: Array<{
    symbol: string;
    quantity: number;
    averageCost: number;
    currentPrice: number;
    marketValue: number;
    unrealizedPnL: number;
  }>;
}

export interface OrderUpdate {
  portfolioId: string;
  order: {
    id: string;
    symbol: string;
    side: 'buy' | 'sell';
    status: string;
    quantity: number;
    price?: number;
  };
}

export interface MarketAlert {
  type: 'price' | 'volume' | 'news';
  symbol: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.connect();
  }

  private connect() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);
      this.setupEventListeners();
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      this.scheduleReconnect();
    }
  }

  private setupEventListeners() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log("WebSocket connected successfully");
      this.reconnectAttempts = 0;
      this.emit('connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    this.ws.onclose = (event) => {
      console.log("WebSocket connection closed:", event.code, event.reason);
      this.emit('disconnected');
      
      if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.emit('error', error);
    };
  }

  private handleMessage(message: any) {
    switch (message.type) {
      case 'price_update':
        this.emit('priceUpdate', message.quotes);
        break;
      case 'ai_signals':
        this.emit('aiSignals', message.signals);
        break;
      case 'new_ai_signal':
        this.emit('newAISignal', message.signal);
        break;
      case 'portfolio_update':
        this.emit('portfolioUpdate', message.portfolio);
        break;
      case 'order_update':
        this.emit('orderUpdate', message);
        break;
      case 'market_alert':
        this.emit('marketAlert', message.alert);
        break;
      case 'error':
        console.error("WebSocket server error:", message.message);
        this.emit('serverError', message.message);
        break;
      default:
        console.log("Unknown message type:", message.type);
    }
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  public send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected. Message not sent:", message);
    }
  }

  public subscribe(symbols: string[]) {
    this.send({
      type: 'subscribe',
      symbols
    });
  }

  public unsubscribe(symbols: string[]) {
    this.send({
      type: 'unsubscribe',
      symbols
    });
  }

  public authenticate(userId: string) {
    this.send({
      type: 'auth',
      userId
    });
  }

  public requestPortfolio() {
    this.send({
      type: 'get_portfolio'
    });
  }

  public requestAISignals() {
    this.send({
      type: 'get_ai_signals'
    });
  }

  public on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsManager = new WebSocketManager();
