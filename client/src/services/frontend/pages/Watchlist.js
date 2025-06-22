import React, { useState, useEffect } from 'react';
import WatchlistItem from '../components/watchlist/WatchlistItem';
import SearchSymbol from '../components/watchlist/SearchSymbol';
import { FaPlus } from 'react-icons/fa';
import '../styles/Watchlist.css';
import { watchlistAPI } from '../../api';

// Symbol to CoinGecko ID and Name mapping
const COINGECKO_MAP = {
  BTC: { id: 'bitcoin', name: 'Bitcoin' },
  ETH: { id: 'ethereum', name: 'Ethereum' },
  SOL: { id: 'solana', name: 'Solana' },
  ADA: { id: 'cardano', name: 'Cardano' },
  XRP: { id: 'ripple', name: 'Ripple' },
  DOT: { id: 'polkadot', name: 'Polkadot' },
  LINK: { id: 'chainlink', name: 'Chainlink' },
  MATIC: { id: 'matic-network', name: 'Polygon' },
  AVAX: { id: 'avalanche-2', name: 'Avalanche' },
  UNI: { id: 'uniswap', name: 'Uniswap' }
};

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [confirmDelete, setConfirmDelete] = useState({ open: false, symbol: null });
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [priceData, setPriceData] = useState({});
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState('');

  // Fetch watchlist on mount
  useEffect(() => {
    const fetchWatchlist = async () => {
      setLoading(true);
      setApiError('');
      try {
        const res = await watchlistAPI.get();
        setWatchlist(res.data.symbols || []);
      } catch (err) {
        setApiError('Failed to load watchlist.');
      } finally {
        setLoading(false);
      }
    };
    fetchWatchlist();
  }, []);

  // Fetch price data whenever watchlist changes
  useEffect(() => {
    const fetchPrices = async () => {
      if (!watchlist.length) return;
      setPriceLoading(true);
      setPriceError('');
      try {
        // Map symbols to CoinGecko IDs
        const ids = watchlist
          .map(sym => COINGECKO_MAP[sym]?.id)
          .filter(Boolean)
          .join(',');
        if (!ids) {
          setPriceData({});
          setPriceLoading(false);
          return;
        }
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_high=true&include_24hr_low=true`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('Failed to fetch prices');
        const data = await resp.json();
        // Build price data per symbol
        const pd = {};
        for (const sym of watchlist) {
          const map = COINGECKO_MAP[sym];
          if (!map) continue;
          const d = data[map.id];
          pd[sym] = {
            name: map.name,
            price: d?.usd ?? null,
            change: d?.usd_24h_change ?? null,
            high: d?.usd_24h_high ?? null,
            low: d?.usd_24h_low ?? null
          };
        }
        setPriceData(pd);
      } catch (err) {
        setPriceError('Failed to load price data.');
      } finally {
        setPriceLoading(false);
      }
    };
    fetchPrices();
  }, [watchlist]);

  // Helper: Validate symbol format
  const isValidSymbol = (symbol) => {
    return /^[A-Z]{2,5}$/.test(symbol);
  };

  const handleAddToWatchlist = async (symbol) => {
    if (!isValidSymbol(symbol)) {
      setFeedback({ type: 'error', message: 'Invalid symbol format. Use 2-5 uppercase letters.' });
      return;
    }
    if (watchlist.includes(symbol)) {
      setFeedback({ type: 'error', message: 'Symbol already in watchlist.' });
      return;
    }
    try {
      setLoading(true);
      await watchlistAPI.addSymbol(symbol);
      const res = await watchlistAPI.get();
      setWatchlist(res.data.symbols || []);
      setFeedback({ type: 'success', message: `${symbol} added to watchlist.` });
      setShowSearchModal(false);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to add symbol. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWatchlist = (symbol) => {
    setConfirmDelete({ open: true, symbol });
  };

  const confirmRemove = async () => {
    try {
      setLoading(true);
      await watchlistAPI.removeSymbol(confirmDelete.symbol);
      const res = await watchlistAPI.get();
      setWatchlist(res.data.symbols || []);
      setFeedback({ type: 'success', message: `${confirmDelete.symbol} removed from watchlist.` });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to remove symbol. Please try again.' });
    } finally {
      setLoading(false);
      setConfirmDelete({ open: false, symbol: null });
    }
  };

  const cancelRemove = () => {
    setConfirmDelete({ open: false, symbol: null });
  };

  const closeFeedback = () => {
    setFeedback({ type: '', message: '' });
  };

  return (
    <div className="watchlist-page">
      <div className="watchlist-header">
        <h1>Watchlist</h1>
        <button className="add-symbol-btn" onClick={() => setShowSearchModal(true)}>
          <FaPlus /> Add Symbol
        </button>
      </div>
      
      {feedback.message && (
        <div className={`feedback-message ${feedback.type}`}> 
          {feedback.message}
          <span className="close-feedback" onClick={closeFeedback}>&times;</span>
        </div>
      )}
      {apiError && (
        <div className="feedback-message error">{apiError}</div>
      )}
      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: '#888' }}>Loading...</div>
      ) : watchlist.length > 0 ? (
        <div className="watchlist-table-container">
          <table className="watchlist-table" style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <thead style={{ background: '#f5f7fa' }}>
              <tr>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Symbol</th>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Price</th>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>24h Change</th>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>24h High</th>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>24h Low</th>
                <th style={{ padding: '12px 8px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {priceError && (
                <tr><td colSpan={7} style={{ color: '#e74c3c', textAlign: 'center' }}>{priceError}</td></tr>
              )}
              {watchlist.map(symbol => (
                <WatchlistItem 
                  key={symbol}
                  symbol={symbol}
                  priceData={priceData[symbol]}
                  onRemove={handleRemoveFromWatchlist}
                />
              ))}
            </tbody>
          </table>
          {priceLoading && <div style={{ textAlign: 'center', color: '#888', marginTop: 8 }}>Updating prices...</div>}
        </div>
      ) : (
        <div className="empty-watchlist">
          <p>Your watchlist is empty. Add symbols to track their prices.</p>
          <button className="add-symbol-btn" onClick={() => setShowSearchModal(true)}>
            <FaPlus /> Add Symbol
          </button>
        </div>
      )}
      
      {showSearchModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={() => setShowSearchModal(false)}>
              &times;
            </span>
            <SearchSymbol onAddToWatchlist={handleAddToWatchlist} watchlist={watchlist} />
          </div>
        </div>
      )}

      {confirmDelete.open && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: 340, textAlign: 'center' }}>
            <p>Are you sure you want to remove <b>{confirmDelete.symbol}</b> from your watchlist?</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 24 }}>
              <button className="remove-btn" onClick={confirmRemove}>Yes, Remove</button>
              <button className="add-symbol-btn" onClick={cancelRemove}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Watchlist; 