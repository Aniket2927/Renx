import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const SelectorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const MarketTypeSelector = styled.div`
  display: flex;
  background: rgba(79, 140, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
`;

const TypeButton = styled.button`
  background: ${props => props.active ? '#4f8cff' : 'transparent'};
  color: ${props => props.active ? '#fff' : '#4f8cff'};
  border: none;
  padding: 8px 15px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.active ? '#4f8cff' : 'rgba(79, 140, 255, 0.2)'};
  }
`;

const MarketDropdown = styled.div`
  position: relative;
`;

const SelectedMarket = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(79, 140, 255, 0.1);
  border: none;
  border-radius: 8px;
  padding: 8px 15px;
  font-size: 0.875rem;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(79, 140, 255, 0.2);
  }
  
  .market-symbol {
    font-weight: 600;
  }
  
  .market-price {
    color: #666;
  }
  
  .market-change {
    margin-left: 8px;
    color: ${props => props.change >= 0 ? '#2dff7a' : '#ff2d7a'};
  }
  
  .dropdown-arrow {
    margin-left: 8px;
    transition: transform 0.2s;
    transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0)'};
  }
`;

const MarketsDropdownMenu = styled(motion.div)`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 5px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 100;
  overflow: hidden;
`;

const MarketItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: ${props => props.active ? 'rgba(79, 140, 255, 0.1)' : 'transparent'};
  border: none;
  padding: 10px 15px;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(79, 140, 255, 0.05);
  }
  
  .market-info {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  
  .market-symbol {
    font-weight: 600;
    font-size: 0.875rem;
  }
  
  .market-name {
    font-size: 0.75rem;
    color: #666;
  }
  
  .market-price {
    font-size: 0.875rem;
  }
  
  .market-change {
    font-size: 0.75rem;
    color: ${props => props.change >= 0 ? '#2dff7a' : '#ff2d7a'};
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 15px;
  border: none;
  border-bottom: 1px solid rgba(79, 140, 255, 0.1);
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    background: rgba(79, 140, 255, 0.05);
  }
`;

const MarketSelector = ({ markets, activeMarket, onMarketChange, marketType, onMarketTypeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    setSearchTerm('');
  };
  
  const handleMarketSelect = (market) => {
    onMarketChange(market);
    setIsOpen(false);
  };
  
  const filteredMarkets = searchTerm 
    ? markets.filter(market => 
        market.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        market.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : markets;
  
  return (
    <SelectorContainer>
      <MarketTypeSelector>
        <TypeButton 
          active={marketType === 'crypto'} 
          onClick={() => onMarketTypeChange('crypto')}
        >
          Crypto
        </TypeButton>
        <TypeButton 
          active={marketType === 'forex'} 
          onClick={() => onMarketTypeChange('forex')}
        >
          Forex
        </TypeButton>
        <TypeButton 
          active={marketType === 'stocks'} 
          onClick={() => onMarketTypeChange('stocks')}
        >
          Stocks
        </TypeButton>
      </MarketTypeSelector>
      
      <MarketDropdown>
        <SelectedMarket 
          onClick={toggleDropdown} 
          isOpen={isOpen}
          change={activeMarket.change}
        >
          <span className="market-symbol">{activeMarket.symbol}</span>
          <span className="market-price">${activeMarket.price.toLocaleString()}</span>
          <span className="market-change">
            {activeMarket.change >= 0 ? '+' : ''}{activeMarket.change}%
          </span>
          <span className="dropdown-arrow">▼</span>
        </SelectedMarket>
        
        {isOpen && (
          <MarketsDropdownMenu
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <SearchInput 
              placeholder="Search markets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            {filteredMarkets.map((market) => (
              <MarketItem 
                key={market.id}
                active={market.id === activeMarket.id}
                change={market.change}
                onClick={() => handleMarketSelect(market)}
              >
                <div className="market-info">
                  <span className="market-symbol">{market.symbol}</span>
                  <span className="market-name">{market.name}</span>
                </div>
                <div className="market-info">
                  <span className="market-price">${market.price.toLocaleString()}</span>
                  <span className="market-change">
                    {market.change >= 0 ? '+' : ''}{market.change}%
                  </span>
                </div>
              </MarketItem>
            ))}
          </MarketsDropdownMenu>
        )}
      </MarketDropdown>
    </SelectorContainer>
  );
};

export default MarketSelector; 