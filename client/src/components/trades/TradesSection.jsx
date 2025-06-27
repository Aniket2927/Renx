import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import AdvancedTradingChart from './AdvancedTradingChart';
import OrderBook from './OrderBook';
import TradeHistory from './TradeHistory';
import MarketSelector from './MarketSelector';
import TestChart from './TestChart';

const TradesSectionContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const TradingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const TradingTitle = styled.h2`
  font-size: 1.5rem;
  color: #4f8cff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TradingGrid = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  grid-template-rows: auto auto;
  gap: 20px;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const ChartSection = styled.div`
  grid-column: 1;
  grid-row: 1;
`;

const OrdersSection = styled.div`
  grid-column: 2;
  grid-row: 1 / span 2;
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  @media (max-width: 1200px) {
    grid-column: 1;
    grid-row: 2;
  }
`;

const HistorySection = styled.div`
  grid-column: 1;
  grid-row: 2;
  
  @media (max-width: 1200px) {
    grid-column: 1;
    grid-row: 3;
  }
`;

const TradingInfoCard = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 20px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  height: 100%;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  color: #4f8cff;
  margin-top: 0;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Mock data for initial state
const initialMarkets = [
  { id: 'btc-usd', name: 'Bitcoin', symbol: 'BTC/USD', price: 65432.10, change: 2.34 },
  { id: 'eth-usd', name: 'Ethereum', symbol: 'ETH/USD', price: 3456.78, change: -1.23 },
  { id: 'sol-usd', name: 'Solana', symbol: 'SOL/USD', price: 123.45, change: 5.67 },
  { id: 'bnb-usd', name: 'Binance Coin', symbol: 'BNB/USD', price: 543.21, change: 0.98 },
  { id: 'xrp-usd', name: 'Ripple', symbol: 'XRP/USD', price: 0.5678, change: -2.34 }
];

const TradesSection = () => {
  console.log("TradesSection component rendered");
  
  const [activeMarket, setActiveMarket] = useState(initialMarkets[0]);
  const [marketType, setMarketType] = useState('crypto');
  const [useTestChart, setUseTestChart] = useState(true);
  
  useEffect(() => {
    console.log("TradesSection mounted");
    return () => console.log("TradesSection unmounted");
  }, []);
  
  const handleMarketChange = (market) => {
    console.log("Market changed to:", market);
    setActiveMarket(market);
  };
  
  const handleMarketTypeChange = (type) => {
    console.log("Market type changed to:", type);
    setMarketType(type);
    // Here we would fetch markets for the selected type
  };
  
  const toggleChartComponent = () => {
    setUseTestChart(!useTestChart);
  };
  
  return (
    <TradesSectionContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ background: '#f0f4fa', padding: '10px', borderRadius: '8px', marginBottom: '10px' }}>
        <h3>Debug Controls</h3>
        <button onClick={toggleChartComponent}>
          {useTestChart ? "Switch to Advanced Chart" : "Switch to Test Chart"}
        </button>
        <p>Current Market: {activeMarket.name} ({activeMarket.symbol})</p>
        <p>Market Type: {marketType}</p>
        <p>Using: {useTestChart ? "Test Chart" : "Advanced Chart"}</p>
      </div>

      <TradingHeader>
        <TradingTitle>
          <span role="img" aria-label="trading">📈</span> Trading Dashboard
        </TradingTitle>
        <MarketSelector 
          markets={initialMarkets}
          activeMarket={activeMarket}
          onMarketChange={handleMarketChange}
          marketType={marketType}
          onMarketTypeChange={handleMarketTypeChange}
        />
      </TradingHeader>
      
      <TradingGrid>
        <ChartSection>
          <TradingInfoCard>
            <SectionTitle>
              <span role="img" aria-label="chart">📊</span> {activeMarket.name} Chart
            </SectionTitle>
            {useTestChart ? (
              <TestChart />
            ) : (
              <AdvancedTradingChart market={activeMarket} />
            )}
          </TradingInfoCard>
        </ChartSection>
        
        <OrdersSection>
          <TradingInfoCard>
            <SectionTitle>
              <span role="img" aria-label="orders">📋</span> Order Book
            </SectionTitle>
            <OrderBook market={activeMarket} />
          </TradingInfoCard>
        </OrdersSection>
        
        <HistorySection>
          <TradingInfoCard>
            <SectionTitle>
              <span role="img" aria-label="history">📜</span> Trade History
            </SectionTitle>
            <TradeHistory market={activeMarket} />
          </TradingInfoCard>
        </HistorySection>
      </TradingGrid>
    </TradesSectionContainer>
  );
};

export default TradesSection; 