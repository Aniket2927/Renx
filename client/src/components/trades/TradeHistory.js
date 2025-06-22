import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

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
      case 'completed': return '#2dff7a';
      case 'pending': return '#ffd02d';
      case 'failed': return '#ff2d7a';
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

// Generate mock trade history data
const generateMockTradeHistory = (basePrice, count = 20) => {
  const trades = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const tradeType = Math.random() > 0.5 ? 'buy' : 'sell';
    const priceVariation = basePrice * 0.005 * (Math.random() - 0.5); // ±0.5% price variation
    const price = basePrice + priceVariation;
    const amount = Math.random() * 2 + 0.1; // Random amount between 0.1 and 2.1
    
    // Random time within the last 24 hours
    const tradeTime = new Date(now);
    tradeTime.setMinutes(now.getMinutes() - Math.floor(Math.random() * 1440)); // up to 24 hours ago
    
    // Random status (mostly completed)
    let status;
    const statusRandom = Math.random();
    if (statusRandom > 0.9) {
      status = 'pending';
    } else if (statusRandom > 0.95) {
      status = 'failed';
    } else {
      status = 'completed';
    }
    
    trades.push({
      id: `trade-${i}`,
      type: tradeType,
      price,
      amount,
      total: price * amount,
      time: tradeTime,
      status
    });
  }
  
  // Sort by time (most recent first)
  trades.sort((a, b) => b.time - a.time);
  
  return trades;
};

// Format time relative to now
const formatTimeAgo = (date) => {
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  
  return date.toLocaleDateString();
};

const TradeHistory = ({ market }) => {
  const [tradeHistory, setTradeHistory] = useState([]);
  
  useEffect(() => {
    // Generate mock trade history data based on market price
    setTradeHistory(generateMockTradeHistory(market.price, 20));
    
    // In a real app, you would fetch trade history from an API
    // and potentially set up a websocket for live updates
    const interval = setInterval(() => {
      // Add a new trade at the top of the list occasionally
      if (Math.random() > 0.7) {
        const newTrade = generateMockTradeHistory(market.price, 1)[0];
        setTradeHistory(prevTrades => [newTrade, ...prevTrades.slice(0, 19)]);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [market]);
  
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
            <HistoryItem key={trade.id}>
              <TradePrice type={trade.type}>
                ${trade.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TradePrice>
              <TradeAmount>
                {trade.amount.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}
              </TradeAmount>
              <TradeTime>
                {formatTimeAgo(trade.time)}
              </TradeTime>
              <TradeStatus status={trade.status}>
                {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
              </TradeStatus>
            </HistoryItem>
          ))
        ) : (
          <NoTradesMessage>
            No recent trades found for this market
          </NoTradesMessage>
        )}
      </HistoryList>
    </HistoryContainer>
  );
};

export default TradeHistory; 