const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stock.controller');

// Get real-time price for a symbol
router.get('/price/:symbol', stockController.getPrice);

// Get multiple stock quotes at once
router.get('/quotes/:symbols', stockController.getQuotes);

// Get chart data (time series)
router.get('/chart/:symbol', stockController.getChartData);

// Get technical indicator
router.get('/indicators/:symbol/:indicator', stockController.getIndicator);

// Search for symbols
router.get('/symbols', stockController.searchSymbols);

// Get batch data (multiple endpoints in one request)
router.get('/batch/:symbol', stockController.getBatchData);

module.exports = router; 