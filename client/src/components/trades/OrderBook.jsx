import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { orderbookAPI } from '../../services/api';

const OrderBookContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  font-size: 0.875rem;
`;

const OrderBookTabs = styled.div`
  display: flex;
  margin-bottom: 15px;
`;

const OrderBookTab = styled.button`
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? '#4f8cff' : 'transparent'};
  color: ${props => props.active ? '#4f8cff' : '#666'};
  padding: 8px 15px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: ${props => props.active ? '600' : '400'};
  
  &:hover {
    color: #4f8cff;
  }
`;

const OrdersHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 8px 0;
  font-size: 0.75rem;
  color: #666;
  border-bottom: 1px solid rgba(79, 140, 255, 0.1);
`;

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex: 1;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(79, 140, 255, 0.05);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(79, 140, 255, 0.2);
    border-radius: 3px;
  }
`;

const OrderItem = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 6px 0;
  font-size: 0.8125rem;
  border-bottom: 1px solid rgba(79, 140, 255, 0.05);
  
  &:last-child {
    border-bottom: none;
  }
`;

const OrderPrice = styled.span`
  color: ${props => props.type === 'buy' ? '#2dff7a' : '#ff2d7a'};
  font-weight: 500;
`;

const OrderQuantity = styled.span`
  color: #333;
`;

const OrderTotal = styled.span`
  color: #666;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  margin: 5px 0;
  border-top: 1px solid rgba(79, 140, 255, 0.1);
  border-bottom: 1px solid rgba(79, 140, 255, 0.1);
`;

const SpreadInfo = styled.div`
  font-size: 0.75rem;
  color: #666;
  
  span {
    color: #4f8cff;
    font-weight: 500;
  }
`;

const PriceInfo = styled.div`
  font-weight: 600;
  color: ${props => props.change >= 0 ? '#2dff7a' : '#ff2d7a'};
`;

// Fallback order book data for when API fails
const getFallbackOrderBook = (basePrice, count = 10) => {
  const buyOrders = [];
  const sellOrders = [];
  
  const priceVariation = basePrice * 0.001; // 0.1% price variation between orders
  
  // Generate buy orders (below base price)
  for (let i = 1; i <= count; i++) {
    const price = basePrice - (i * priceVariation);
    const quantity = Math.random() * 2 + 0.1; // Random quantity between 0.1 and 2.1
    
    buyOrders.push({
      id: `buy-${i}`,
      price,
      quantity,
      total: price * quantity
    });
  }
  
  // Generate sell orders (above base price)
  for (let i = 1; i <= count; i++) {
    const price = basePrice + (i * priceVariation);
    const quantity = Math.random() * 2 + 0.1; // Random quantity between 0.1 and 2.1
    
    sellOrders.push({
      id: `sell-${i}`,
      price,
      quantity,
      total: price * quantity
    });
  }
  
  // Sort orders by price
  buyOrders.sort((a, b) => b.price - a.price); // Descending price for buy orders
  sellOrders.sort((a, b) => a.price - b.price); // Ascending price for sell orders
  
  return { buyOrders, sellOrders };
};

const OrderBook = ({ market }) => {
  const [activeTab, setActiveTab] = useState('both');
  
  // Real API integration for order book data
  const { data: orderBookData, isLoading, error } = useQuery({
    queryKey: ['/api/orderbook', market?.symbol],
    queryFn: async () => {
      if (!market?.symbol) return null;
      
      try {
        const response = await orderbookAPI.get(market.symbol);
        return response.data;
      } catch (error) {
        console.error('Error fetching order book:', error);
        // Fallback to generated data if API fails
        return getFallbackOrderBook(market.price, 12);
      }
    },
    enabled: !!market?.symbol,
    refetchInterval: 2000, // Refresh every 2 seconds for real-time updates
    staleTime: 1000, // Consider data stale after 1 second
  });
  
  // Transform API data to expected format
  const orderBook = orderBookData ? {
    buyOrders: orderBookData.bids?.map(bid => ({
      id: `buy-${bid.price}`,
      price: bid.price,
      quantity: bid.quantity,
      total: bid.price * bid.quantity
    })) || [],
    sellOrders: orderBookData.asks?.map(ask => ({
      id: `sell-${ask.price}`,
      price: ask.price,
      quantity: ask.quantity,
      total: ask.price * ask.quantity
    })) || []
  } : { buyOrders: [], sellOrders: [] };
  
  // Calculate the spread between highest buy and lowest sell
  const highestBuy = orderBook.buyOrders[0]?.price || 0;
  const lowestSell = orderBook.sellOrders[0]?.price || 0;
  const spread = lowestSell - highestBuy;
  const spreadPercentage = market?.price ? (spread / market.price) * 100 : 0;
  
  // Loading state
  if (isLoading) {
    return (
      <OrderBookContainer>
        <OrderBookTabs>
          <OrderBookTab active={true}>Order Book</OrderBookTab>
        </OrderBookTabs>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: '#4f8cff' }}>
          Loading order book...
        </div>
      </OrderBookContainer>
    );
  }
  
  // Error state
  if (error && orderBook.buyOrders.length === 0 && orderBook.sellOrders.length === 0) {
    return (
      <OrderBookContainer>
        <OrderBookTabs>
          <OrderBookTab active={true}>Order Book</OrderBookTab>
        </OrderBookTabs>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: '#ff2d7a' }}>
          Error loading order book
        </div>
      </OrderBookContainer>
    );
  }
  
  return (
    <OrderBookContainer>
      <OrderBookTabs>
        <OrderBookTab 
          active={activeTab === 'both'} 
          onClick={() => setActiveTab('both')}
        >
          Order Book
        </OrderBookTab>
        <OrderBookTab 
          active={activeTab === 'buys'} 
          onClick={() => setActiveTab('buys')}
        >
          Buys
        </OrderBookTab>
        <OrderBookTab 
          active={activeTab === 'sells'} 
          onClick={() => setActiveTab('sells')}
        >
          Sells
        </OrderBookTab>
      </OrderBookTabs>
      
      {(activeTab === 'both' || activeTab === 'sells') && (
        <>
          <OrdersHeader>
            <span>Price (USD)</span>
            <span>Amount ({market.symbol.split('/')[0]})</span>
            <span>Total (USD)</span>
          </OrdersHeader>
          <OrdersList>
            {orderBook.sellOrders.map(order => (
              <OrderItem key={order.id}>
                <OrderPrice type="sell">
                  ${order.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </OrderPrice>
                <OrderQuantity>
                  {order.quantity.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}
                </OrderQuantity>
                <OrderTotal>
                  ${order.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </OrderTotal>
              </OrderItem>
            ))}
          </OrdersList>
        </>
      )}
      
      {activeTab === 'both' && (
        <Divider>
          <SpreadInfo>
            Spread: <span>${spread.toFixed(2)} ({spreadPercentage.toFixed(3)}%)</span>
          </SpreadInfo>
          <PriceInfo change={market.change}>
            ${market.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </PriceInfo>
        </Divider>
      )}
      
      {(activeTab === 'both' || activeTab === 'buys') && (
        <>
          {activeTab === 'buys' && (
            <OrdersHeader>
              <span>Price (USD)</span>
              <span>Amount ({market.symbol.split('/')[0]})</span>
              <span>Total (USD)</span>
            </OrdersHeader>
          )}
          <OrdersList>
            {orderBook.buyOrders.map(order => (
              <OrderItem key={order.id}>
                <OrderPrice type="buy">
                  ${order.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </OrderPrice>
                <OrderQuantity>
                  {order.quantity.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}
                </OrderQuantity>
                <OrderTotal>
                  ${order.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </OrderTotal>
              </OrderItem>
            ))}
          </OrdersList>
        </>
      )}
    </OrderBookContainer>
  );
};

export default OrderBook; 