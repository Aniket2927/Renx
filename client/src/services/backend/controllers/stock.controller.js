const twelveDataAPI = require('../utils/twelveDataAPI');

// Error handling wrapper for controllers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(err => {
    console.error('Controller error:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error',
      code: err.code || 'UNKNOWN_ERROR'
    });
  });
};

exports.getPrice = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  
  if (!symbol) {
    return res.status(400).json({
      success: false,
      message: 'Symbol is required'
    });
  }
  
  const data = await twelveDataAPI.getPrice(symbol);
  
  res.json({
    success: true,
    data
  });
});

exports.getQuotes = asyncHandler(async (req, res) => {
  const { symbols } = req.params;
  
  if (!symbols) {
    return res.status(400).json({
      success: false,
      message: 'Symbols are required'
    });
  }
  
  const symbolsArray = symbols.split(',');
  const data = await twelveDataAPI.getQuotes(symbolsArray);
  
  res.json({
    success: true,
    data
  });
});

exports.getChartData = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { interval = '1day', outputsize = 30 } = req.query;
  
  if (!symbol) {
    return res.status(400).json({
      success: false,
      message: 'Symbol is required'
    });
  }
  
  const data = await twelveDataAPI.getTimeSeries(symbol, interval, outputsize);
  
  res.json({
    success: true,
    data
  });
});

exports.getIndicator = asyncHandler(async (req, res) => {
  const { symbol, indicator } = req.params;
  const { interval = '1day', outputsize = 30 } = req.query;
  
  if (!symbol || !indicator) {
    return res.status(400).json({
      success: false,
      message: 'Symbol and indicator are required'
    });
  }
  
  const data = await twelveDataAPI.getIndicator(symbol, indicator, interval, outputsize, req.query);
  
  res.json({
    success: true,
    data
  });
});

exports.searchSymbols = asyncHandler(async (req, res) => {
  const { exchange = 'NASDAQ' } = req.query;
  
  const data = await twelveDataAPI.getSymbols(exchange);
  
  res.json({
    success: true,
    data
  });
});

// Get multiple endpoints data at once to reduce API calls
exports.getBatchData = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const { endpoints = 'quote,time_series' } = req.query;
  
  if (!symbol) {
    return res.status(400).json({
      success: false,
      message: 'Symbol is required'
    });
  }
  
  const endpointsArray = endpoints.split(',');
  const results = {};
  
  // Execute requests in parallel
  await Promise.all(endpointsArray.map(async endpoint => {
    try {
      switch(endpoint) {
        case 'quote':
          results.quote = await twelveDataAPI.getQuotes(symbol);
          break;
        case 'time_series':
          results.time_series = await twelveDataAPI.getTimeSeries(
            symbol, 
            req.query.interval || '1day', 
            req.query.outputsize || 30
          );
          break;
        case 'price':
          results.price = await twelveDataAPI.getPrice(symbol);
          break;
        default:
          // For indicators like rsi, macd, etc.
          if (req.query[endpoint]) {
            results[endpoint] = await twelveDataAPI.getIndicator(
              symbol, 
              endpoint, 
              req.query.interval || '1day',
              req.query.outputsize || 30,
              req.query
            );
          }
      }
    } catch (error) {
      results[endpoint] = { error: error.message };
    }
  }));
  
  res.json({
    success: true,
    data: results
  });
}); 