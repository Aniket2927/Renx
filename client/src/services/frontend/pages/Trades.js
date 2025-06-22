import React, { useState } from 'react';
import TradesList from '../components/trades/TradesList';
import TradeForm from '../components/trades/TradeForm';
import '../styles/Trades.css';

const Trades = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);
  
  // Mock trades data
  const [trades, setTrades] = useState([
    {
      _id: '1',
      symbol: 'BTC',
      type: 'buy',
      amount: 0.5,
      price: 42000,
      status: 'completed',
      createdAt: new Date().toISOString()
    },
    {
      _id: '2',
      symbol: 'ETH',
      type: 'sell',
      amount: 2.5,
      price: 2300,
      status: 'completed',
      createdAt: new Date().toISOString()
    },
    {
      _id: '3',
      symbol: 'SOL',
      type: 'buy',
      amount: 10,
      price: 145,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
  ]);
  
  const handleCreateTrade = (tradeData) => {
    const newTrade = {
      _id: Date.now().toString(),
      ...tradeData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    setTrades([newTrade, ...trades]);
    setShowForm(false);
  };
  
  const handleEditTrade = (tradeId, updatedData) => {
    setTrades(trades.map(trade => 
      trade._id === tradeId ? { ...trade, ...updatedData } : trade
    ));
    setEditingTrade(null);
    setShowForm(false);
  };
  
  const handleDeleteTrade = (tradeId) => {
    setTrades(trades.filter(trade => trade._id !== tradeId));
  };
  
  const openEditForm = (trade) => {
    setEditingTrade(trade);
    setShowForm(true);
  };
  
  return (
    <div className="trades-page">
      <div className="trades-header">
        <h1>Trades</h1>
        <button 
          className="create-trade-btn" 
          onClick={() => {
            setEditingTrade(null);
            setShowForm(true);
          }}
        >
          Create Trade
        </button>
      </div>
      
      {showForm ? (
        <TradeForm 
          onSubmit={editingTrade ? handleEditTrade : handleCreateTrade}
          initialValues={editingTrade}
        />
      ) : (
        <TradesList 
          trades={trades}
          onEdit={openEditForm}
          onDelete={handleDeleteTrade}
        />
      )}
    </div>
  );
};

export default Trades; 