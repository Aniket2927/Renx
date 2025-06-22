import React, { useState, useEffect } from 'react';
import { 
  FaRobot, 
  FaChartLine, 
  FaSignal, 
  FaArrowUp, 
  FaArrowDown, 
  FaTwitter, 
  FaNewspaper,
  FaRegThumbsUp,
  FaRegThumbsDown,
  FaInfoCircle,
  FaLightbulb,
  FaSync
} from 'react-icons/fa';
import TradeModal from '../trades/TradeModal';
import aiService from '../../../../services/ai/aiService';
import marketDataService from '../../../../services/marketDataService';
import ReactApexChart from 'react-apexcharts';

const AITradingWidget = () => {
  const [activeTab, setActiveTab] = useState('signals');
  const [loading, setLoading] = useState(true);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshedItems, setRefreshedItems] = useState([]);
  
  // Mock data for AI signals
  const initialTradingSignals = [
    { 
      id: 1, 
      asset: 'BTC/USD', 
      signal: 'buy', 
      confidence: 87, 
      prediction: '+5.3%', 
      timestamp: '10 min ago',
      price: '46,892.32'
    },
    { 
      id: 2, 
      asset: 'ETH/USD', 
      signal: 'sell', 
      confidence: 76, 
      prediction: '-2.1%', 
      timestamp: '25 min ago',
      price: '3,341.56'
    },
    { 
      id: 3, 
      asset: 'XRP/USD', 
      signal: 'neutral', 
      confidence: 52, 
      prediction: '+0.3%', 
      timestamp: '42 min ago',
      price: '0.5487'
    },
    { 
      id: 4, 
      asset: 'SOL/USD', 
      signal: 'buy', 
      confidence: 91, 
      prediction: '+7.8%', 
      timestamp: '15 min ago',
      price: '103.45'
    }
  ];
  
  const [tradingSignals, setTradingSignals] = useState(initialTradingSignals);
  
  // Mock data for market sentiment
  const sentimentData = [
    { asset: 'Bitcoin', positive: 67, negative: 23, neutral: 10 },
    { asset: 'Ethereum', positive: 58, negative: 31, neutral: 11 },
    { asset: 'DeFi Sector', positive: 62, negative: 28, neutral: 10 },
    { asset: 'NFT Market', positive: 48, negative: 42, neutral: 10 }
  ];
  
  // Mock news data
  const newsData = [
    { 
      id: 1, 
      title: 'Federal Reserve signals potential interest rate cut', 
      source: 'Financial Times', 
      impact: 'bullish', 
      time: '2 hours ago' 
    },
    { 
      id: 2, 
      title: 'Major tech company announces crypto payment integration', 
      source: 'TechCrunch', 
      impact: 'bullish', 
      time: '5 hours ago' 
    },
    { 
      id: 3, 
      title: 'Regulatory concerns grow in Asian markets', 
      source: 'Bloomberg', 
      impact: 'bearish', 
      time: '3 hours ago' 
    }
  ];
  
  // Mock portfolio recommendations
  const portfolioRecommendations = [
    { 
      id: 1, 
      action: 'Increase allocation', 
      asset: 'Technology stocks', 
      reason: 'Strong growth indicators in AI sector',
      impact: 'high'
    },
    { 
      id: 2, 
      action: 'Reduce exposure', 
      asset: 'Small-cap cryptocurrencies', 
      reason: 'Increasing market volatility',
      impact: 'medium'
    },
    { 
      id: 3, 
      action: 'Maintain position', 
      asset: 'Blue-chip stocks', 
      reason: 'Stable performance expected',
      impact: 'low'
    }
  ];
  
  // New state for tab and input
  const [tab, setTab] = useState('short-term');
  const [symbol, setSymbol] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [history, setHistory] = useState(() => {
    // Load prediction history from localStorage
    const saved = localStorage.getItem('predictionHistory');
    return saved ? JSON.parse(saved) : [];
  });
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Function to generate a random price change percentage between -10% and +10%
  const generateRandomPriceChange = () => {
    const change = (Math.random() * 20 - 10).toFixed(1);
    return change >= 0 ? `+${change}%` : `${change}%`;
  };
  
  // Function to generate a random confidence level between 50 and 95
  const generateRandomConfidence = () => {
    return Math.floor(Math.random() * 46) + 50;
  };
  
  // Function to determine a signal type based on price change
  const determineSignalType = (priceChange) => {
    const change = parseFloat(priceChange);
    if (change >= 3) return 'buy';
    if (change <= -3) return 'sell';
    return 'neutral';
  };
  
  // Function to update price based on prediction
  const updatePrice = (currentPrice, prediction) => {
    const price = parseFloat(currentPrice.replace(/,/g, ''));
    const change = parseFloat(prediction) / 100;
    const newPrice = (price * (1 + change)).toFixed(2);
    
    // Format with commas for thousands
    return newPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Function to refresh trading signals
  const refreshData = () => {
    setIsRefreshing(true);
    
    // Simulate API call with a delay
    setTimeout(() => {
      const updatedSignals = tradingSignals.map(signal => {
        // Generate new prediction
        const newPrediction = generateRandomPriceChange();
        
        // Update signal type based on new prediction
        const newSignalType = determineSignalType(newPrediction);
        
        // Update price based on prediction
        const newPrice = updatePrice(signal.price, newPrediction);
        
        return {
          ...signal,
          signal: newSignalType,
          confidence: generateRandomConfidence(),
          prediction: newPrediction,
          timestamp: 'just now',
          price: newPrice
        };
      });
      
      setTradingSignals(updatedSignals);
      
      // Set all items as refreshed
      setRefreshedItems(updatedSignals.map(signal => signal.id));
      
      // After animation completes, remove the updated class
      setTimeout(() => {
        setRefreshedItems([]);
      }, 1500);
      
      setIsRefreshing(false);
    }, 1000);
  };
  
  const getSignalColor = (signal) => {
    switch(signal) {
      case 'buy': return '#2ecc71';
      case 'sell': return '#e74c3c';
      default: return '#f1c40f';
    }
  };
  
  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#2ecc71';
    if (confidence >= 60) return '#f1c40f';
    return '#e74c3c';
  };
  
  const getSentimentColor = (sentiment) => {
    switch(sentiment) {
      case 'bullish': return '#2ecc71';
      case 'bearish': return '#e74c3c';
      default: return '#95a5a6';
    }
  };
  
  const getImpactColor = (impact) => {
    switch(impact) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f1c40f';
      default: return '#2ecc71';
    }
  };
  
  const handleTradeClick = (signal) => {
    setSelectedSignal(signal);
    setTradeModalOpen(true);
  };
  
  const closeTradeModal = () => {
    setTradeModalOpen(false);
    setSelectedSignal(null);
  };
  
  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);
    try {
      // Fetch historical data for the symbol
      const hist = await marketDataService.getTimeSeries(symbol);
      setHistoricalData(hist);
      // Get prediction
      const result = await aiService.getPrediction(symbol, hist.map(d => d.y[3]));
      setPrediction(result);
      // Save to history
      const newEntry = {
        symbol,
        prediction: result.prediction,
        confidence: result.confidence,
        date: new Date().toLocaleString()
      };
      const newHistory = [newEntry, ...history].slice(0, 10); // Keep last 10
      setHistory(newHistory);
      localStorage.setItem('predictionHistory', JSON.stringify(newHistory));
    } catch (err) {
      setError('Failed to fetch prediction.');
    } finally {
      setLoading(false);
    }
  };
  
  // Chart options
  const chartOptions = {
    chart: {
      type: 'line',
      height: 220,
      toolbar: { show: false },
      animations: { enabled: true }
    },
    xaxis: {
      type: 'datetime',
      labels: { style: { fontSize: '11px' } }
    },
    yaxis: {
      labels: { formatter: v => `$${v.toFixed(2)}` }
    },
    markers: {
      size: 5,
      colors: ['#6366f1'],
      strokeColors: '#fff',
      strokeWidth: 2
    },
    annotations: prediction ? {
      yaxis: [
        {
          y: prediction.prediction,
          borderColor: '#22d3ee',
          label: {
            borderColor: '#22d3ee',
            style: { color: '#fff', background: '#22d3ee' },
            text: `Predicted: $${prediction.prediction.toFixed(2)}`
          }
        }
      ]
    } : {},
    tooltip: { enabled: true }
  };

  const chartSeries = [
    {
      name: 'Close Price',
      data: historicalData.map(d => ({ x: d.x, y: d.y[3] }))
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full mx-auto flex flex-col min-h-[520px]">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-800 leading-tight">AI Prediction for Stock Market</h2>
        <span className="text-xs text-gray-400 font-semibold">AI</span>
      </div>
      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 mb-4 overflow-x-auto no-scrollbar">
        <button
          className={`px-3 py-1 text-sm font-medium rounded-t transition-colors duration-150 ${tab === 'short-term' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}
          onClick={() => setTab('short-term')}
        >
          Short-Term Price
        </button>
        <button
          className={`px-3 py-1 text-sm font-medium rounded-t transition-colors duration-150 ${tab === 'volatility' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}
          onClick={() => setTab('volatility')}
        >
          Volatility
        </button>
        <button
          className={`px-3 py-1 text-sm font-medium rounded-t transition-colors duration-150 ${tab === 'range' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-blue-600'}`}
          onClick={() => setTab('range')}
        >
          Price Range
        </button>
      </div>
      {/* Tab Content */}
      <div className="flex-1 flex flex-col justify-between">
        {tab === 'short-term' && (
          <>
            <div>
              <p className="text-gray-600 text-sm mb-4">Predicts intraday or 3-day price movement (LSTM, GRU, Prophet).</p>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                placeholder="Enter stock symbol (e.g. TSLA)"
                value={symbol}
                onChange={e => setSymbol(e.target.value)}
                disabled={loading}
              />
            </div>
            <button
              className="w-full py-2 rounded-md bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-base shadow hover:from-blue-600 hover:to-purple-600 transition-colors disabled:opacity-60"
              onClick={handlePredict}
              disabled={loading || !symbol.trim()}
            >
              {loading ? 'Predicting...' : 'Predict'}
            </button>
            {error && <div className="text-red-500 text-sm mt-3">{error}</div>}
            {prediction && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
                <div className="text-gray-700 text-sm font-medium mb-1">Predicted Price</div>
                <div className="text-2xl font-bold text-blue-700 mb-1">${prediction.prediction?.toFixed(2) ?? 'N/A'}</div>
                {/* Confidence Progress Bar */}
                <div className="w-full h-3 bg-gray-200 rounded-full mt-2 mb-1">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${getConfidenceColor(prediction.confidence)}`}
                    style={{ width: `${Math.round((prediction.confidence || 0) * 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">Confidence: {(prediction.confidence * 100).toFixed(1)}%</div>
              </div>
            )}
            {/* Chart */}
            {historicalData.length > 0 && (
              <div className="mt-6">
                <ReactApexChart
                  options={chartOptions}
                  series={chartSeries}
                  type="line"
                  height={220}
                />
              </div>
            )}
          </>
        )}
        {tab === 'volatility' && (
          <div className="text-gray-600 text-sm flex-1 flex items-center justify-center text-center">
            Volatility prediction coming soon.
          </div>
        )}
        {tab === 'range' && (
          <div className="text-gray-600 text-sm flex-1 flex items-center justify-center text-center">
            Price range prediction coming soon.
          </div>
        )}
      </div>
      {/* Prediction History */}
      {history.length > 0 && (
        <div className="mt-8">
          <h3 className="text-base font-semibold text-gray-700 mb-2">Prediction History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-left border rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1 font-medium">Symbol</th>
                  <th className="px-2 py-1 font-medium">Predicted</th>
                  <th className="px-2 py-1 font-medium">Confidence</th>
                  <th className="px-2 py-1 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-2 py-1">{h.symbol}</td>
                    <td className="px-2 py-1">${h.prediction?.toFixed(2) ?? 'N/A'}</td>
                    <td className="px-2 py-1">{(h.confidence * 100).toFixed(1)}%</td>
                    <td className="px-2 py-1 whitespace-nowrap">{h.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Trade Modal */}
      {selectedSignal && (
        <TradeModal
          isOpen={tradeModalOpen}
          onClose={closeTradeModal}
          asset={selectedSignal.asset}
          signalType={selectedSignal.signal}
          price={selectedSignal.price}
        />
      )}
    </div>
  );
};

export default AITradingWidget; 