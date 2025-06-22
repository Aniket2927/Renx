import { storage } from "../storage";
import { marketDataService } from "./marketDataService";
import type { InsertOrder, Order } from "../../shared/schema";

export interface OrderRequest {
  portfolioId: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: string;
  orderType: 'market' | 'limit';
  price?: string;
  timeInForce: 'day' | 'gtc' | 'ioc';
}

export interface OrderResult {
  success: boolean;
  orderId: string;
  message: string;
  executionPrice?: number;
  executedQuantity?: number;
}

export class TradingService {
  async placeOrder(orderRequest: OrderRequest, userId: string): Promise<OrderResult> {
    try {
      // Validate order
      if (parseFloat(orderRequest.quantity) <= 0) {
        return {
          success: false,
          orderId: '',
          message: 'Invalid quantity'
        };
      }

      // Get current market price for market orders
      let executionPrice = orderRequest.price ? parseFloat(orderRequest.price) : undefined;
      if (orderRequest.orderType === 'market') {
        const quote = await marketDataService.getStockQuote(orderRequest.symbol);
        executionPrice = quote.price;
      }

      // Create order in database
      const orderData: InsertOrder = {
        portfolioId: orderRequest.portfolioId,
        symbol: orderRequest.symbol,
        side: orderRequest.side,
        quantity: orderRequest.quantity,
        orderType: orderRequest.orderType,
        price: executionPrice?.toString(),
        timeInForce: orderRequest.timeInForce,
        status: 'pending'
      };

      const order = await storage.createOrder(orderData);

      // Execute order logic here
      const executionResult = await this.executeOrder(order);

      // Update order status
      await storage.updateOrder(order.id, {
        status: executionResult.status,
        filledQuantity: executionResult.filledQuantity?.toString(),
        filledPrice: executionResult.filledPrice?.toString()
      });

      return {
        success: executionResult.status === 'filled',
        orderId: order.id,
        message: executionResult.status === 'filled' ? 'Order executed successfully' : 'Order placed',
        executionPrice: executionResult.filledPrice,
        executedQuantity: executionResult.filledQuantity
      };
    } catch (error: any) {
      console.error('Error placing order:', error);
      throw new Error(`Failed to place order: ${error.message}`);
    }
  }

  private async executeOrder(order: Order): Promise<{
    status: 'filled' | 'partial' | 'pending';
    filledQuantity?: number;
    filledPrice?: number;
  }> {
    // Simple execution logic - in production this would be more complex
    if (order.orderType === 'market') {
      return {
        status: 'filled',
        filledQuantity: parseFloat(order.quantity),
        filledPrice: order.price ? parseFloat(order.price) : undefined
      };
    }

    // For limit orders, assume they execute immediately for demo
    return {
      status: 'filled',
      filledQuantity: parseFloat(order.quantity),
      filledPrice: order.price ? parseFloat(order.price) : undefined
    };
  }

  async updatePosition(portfolioId: string, symbol: string, quantity: number, price: number): Promise<void> {
    try {
      const existingPosition = await storage.getPosition(portfolioId, symbol);
      
      if (existingPosition) {
        const currentQuantity = parseFloat(existingPosition.quantity);
        const currentValue = parseFloat(existingPosition.averageCost) * currentQuantity;
        const newValue = price * quantity;
        const totalValue = currentValue + newValue;
        const newQuantity = currentQuantity + quantity;
        
        let newAveragePrice: number;
        if (newQuantity > 0) {
          newAveragePrice = totalValue / newQuantity;
        } else {
          newAveragePrice = newQuantity > 0 ? parseFloat(existingPosition.averageCost) : 0;
        }

        await storage.upsertPosition({
          id: existingPosition.id,
          portfolioId,
          symbol,
          quantity: newQuantity.toString(),
          averageCost: newAveragePrice.toString(),
          currentPrice: price.toString(),
          marketValue: (newQuantity * price).toString(),
          unrealizedPnL: ((price - newAveragePrice) * newQuantity).toString(),
          assetType: 'stock'
        });
      } else {
        await storage.upsertPosition({
          portfolioId,
          symbol,
          quantity: quantity.toString(),
          averageCost: price.toString(),
          currentPrice: price.toString(),
          marketValue: (quantity * price).toString(),
          unrealizedPnL: '0',
          assetType: 'stock'
        });
      }
    } catch (error: any) {
      console.error('Error updating position:', error);
      throw error;
    }
  }

  async cancelOrder(orderId: string, userId: string): Promise<void> {
    try {
      await storage.updateOrder(orderId, {
        status: 'cancelled'
      });
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      throw new Error(`Failed to cancel order: ${error.message}`);
    }
  }

  async getPortfolioPerformance(portfolioId: string): Promise<{
    totalValue: number;
    totalReturn: number;
    dailyPnL: number;
    totalReturnPercent: number;
  }> {
    try {
      const positions = await storage.getPortfolioPositions(portfolioId);
      
      let totalValue = 0;
      let totalCost = 0;
      
      for (const position of positions) {
        const marketValue = parseFloat(position.marketValue);
        const quantity = parseFloat(position.quantity);
        const averageCost = parseFloat(position.averageCost);
        
        totalValue += marketValue;
        totalCost += quantity * averageCost;
      }
      
      const totalReturn = totalValue - totalCost;
      const totalReturnPercent = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;
      
      return {
        totalValue,
        totalReturn,
        dailyPnL: 0, // Would need historical data to calculate
        totalReturnPercent
      };
    } catch (error: any) {
      console.error('Error calculating portfolio performance:', error);
      throw error;
    }
  }

  async calculateRiskMetrics(portfolioId: string): Promise<{
    portfolioRisk: number;
    var95: number;
    sharpeRatio: number;
    maxDrawdown: number;
  }> {
    try {
      const positions = await storage.getPortfolioPositions(portfolioId);
      
      // Simple risk calculation - in production this would be more sophisticated
      const totalValue = positions.reduce((sum, pos) => sum + parseFloat(pos.marketValue), 0);
      const portfolioRisk = Math.min(totalValue * 0.02, 100); // 2% of portfolio value as risk
      
      return {
        portfolioRisk,
        var95: portfolioRisk * 1.65, // Approximate 95% VaR
        sharpeRatio: 1.2, // Placeholder
        maxDrawdown: portfolioRisk * 2 // Placeholder
      };
    } catch (error: any) {
      console.error('Error calculating risk metrics:', error);
      throw error;
    }
  }
}

export const tradingService = new TradingService();