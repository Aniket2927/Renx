const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlist.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Watchlist routes
router.get('/', watchlistController.get);
router.post('/symbols', watchlistController.addSymbol);
router.delete('/symbols/:symbol', watchlistController.removeSymbol);

module.exports = router; 