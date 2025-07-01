import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import styled from 'styled-components';
import { tradesAPI } from '../../services/api';

const HistoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const HistoryHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  padding: 8px 0;
  font-size: 0.75rem;
  color: #666;
  border-bottom: 1px solid rgba(79, 140, 255, 0.1);
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: 350px;
  
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

const HistoryItem = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  padding: 8px 0;
  font-size: 0.8125rem;
  border-bottom: 1px solid rgba(79, 140, 255, 0.05);
  
  &:last-child {
    border-bottom: none;
  }
`;

const TradePrice = styled.span`
  color: ${props => props.type === 'buy' ? '#2dff7a' : '#ff2d7a'};
  font-weight: 500;
`;

const TradeAmount = styled.span`
  color: #333;
`;

const TradeTime = styled.span`
  color: #666;
  font-size: 0.75rem;
`;

const TradeStatus = styled.span`
  color: ${props => {
    switch(props.status) {
      case 'completed':
      case 'filled': return '#2dff7a';
      case 'pending': return '#ffd02d';
      case 'failed':
      case 'cancelled':
      case 'rejected': return '#ff2d7a';
      default: return '#666';
    }
  }};
  font-weight: 500;
`;

const NoTradesMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  font-style: italic;
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #4f8cff;
  font-style: italic;
`;

// Format time relative to now
const formatTimeAgo = (date) => {
  const tradeDate = new Date(date);
  const now = new Date();
  const diffMs = now - tradeDate;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  
  return tradeDate.toLocaleDateString();
};

const TradeHistory = ({ market }) => {
  // REAL DATA INTEGRATION: Fetch actual trade history from backend
  const { data: tradeHistory = [], isLoading, error } = useQuery({
    queryKey: ['/api/trades/history', market?.symbol],
    queryFn: async () => {
      if (!market?.symbol) return [];
      
      try {
        const response = await tradesAPI.getTradeHistory(market.symbol);
        return response.data || [];
      } catch (error) {
        console.error('Error fetching trade history:', error);
        return [];
      }
    },
    enabled: !!market?.symbol,
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  // Real-time updates using WebSocket or polling for new trades
  useEffect(() => {
    if (!market?.symbol) return;

    // Set up real-time updates (polling approach)
    const interval = setInterval(async () => {
      try {
        // In production, this would be replaced with WebSocket updates
        // For now, we rely on React Query's refetchInterval
      } catch (error) {
        console.error('Error updating trade history:', error);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [market?.symbol]);

  if (isLoading) {
    return (
      <HistoryContainer>
        <HistoryHeader>
          <span>Price (USD)</span>
          <span>Amount</span>
          <span>Time</span>
          <span>Status</span>
        </HistoryHeader>
        <LoadingMessage>
          Loading trade history...
        </LoadingMessage>
      </HistoryContainer>
    );
  }

  if (error) {
    return (
      <HistoryContainer>
        <HistoryHeader>
          <span>Price (USD)</span>
          <span>Amount</span>
          <span>Time</span>
          <span>Status</span>
        </HistoryHeader>
        <NoTradesMessage>
          Error loading trade history. Please try again.
        </NoTradesMessage>
      </HistoryContainer>
    );
  }
  
  return (
    <HistoryContainer>
      <HistoryHeader>
        <span>Price (USD)</span>
        <span>Amount</span>
        <span>Time</span>
        <span>Status</span>
      </HistoryHeader>
      
      <HistoryList>
        {tradeHistory.length > 0 ? (
          tradeHistory.map(trade => (
            <HistoryItem key={trade.id || trade.orderId}>
              <TradePrice type={trade.side || trade.type}>
                ${(trade.price || trade.filledPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TradePrice>
              <TradeAmount>
                {(trade.quantity || trade.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}
              </TradeAmount>
              <TradeTime>
                {formatTimeAgo(trade.createdAt || trade.timestamp || trade.time)}
              </TradeTime>
              <TradeStatus status={trade.status}>
                {(trade.status || 'unknown').charAt(0).toUpperCase() + (trade.status || 'unknown').slice(1)}
              </TradeStatus>
            </HistoryItem>
          ))
        ) : (
          <NoTradesMessage>
            No recent trades found for {market?.symbol || 'this market'}
          </NoTradesMessage>
        )}
      </HistoryList>
    </HistoryContainer>
  );
};

export default TradeHistory; 