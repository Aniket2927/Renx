const db = require('../models');
const Watchlist = db.watchlists;
const User = db.users;
const { Op } = require('sequelize');

// Get user's watchlist
exports.get = async (req, res) => {
  try {
    let watchlist = await Watchlist.findOne({
      where: { userId: req.userId },
      include: [{
        model: User,
        attributes: ['username', 'email']
      }]
    });
    
    // Create default watchlist if none exists
    if (!watchlist) {
      watchlist = await Watchlist.create({
        userId: req.userId,
        name: 'Default',
        symbols: ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'],
        isDefault: true
      });
      
      // Fetch with user info
      watchlist = await Watchlist.findByPk(watchlist.id, {
        include: [{
          model: User,
          attributes: ['username', 'email']
        }]
      });
    }
    
    res.status(200).json(watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add symbol to watchlist
exports.addSymbol = async (req, res) => {
  try {
    const { symbol } = req.body;
    
    if (!symbol) {
      return res.status(400).json({ message: 'Symbol is required' });
    }
    
    let watchlist = await Watchlist.findOne({
      where: { userId: req.userId }
    });
    
    // Create watchlist if it doesn't exist
    if (!watchlist) {
      watchlist = await Watchlist.create({
        userId: req.userId,
        name: 'Default',
        symbols: [symbol.toUpperCase()],
        isDefault: true
      });
    } else {
      // Add symbol if not already present
      const currentSymbols = watchlist.symbols || [];
      const upperSymbol = symbol.toUpperCase();
      
      if (!currentSymbols.includes(upperSymbol)) {
        const updatedSymbols = [...currentSymbols, upperSymbol];
        await watchlist.update({ symbols: updatedSymbols });
      }
    }
    
    // Fetch updated watchlist with user info
    const updatedWatchlist = await Watchlist.findByPk(watchlist.id, {
      include: [{
        model: User,
        attributes: ['username', 'email']
      }]
    });
    
    res.status(200).json(updatedWatchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove symbol from watchlist
exports.removeSymbol = async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const watchlist = await Watchlist.findOne({
      where: { userId: req.userId }
    });
    
    if (!watchlist) {
      return res.status(404).json({ message: 'Watchlist not found' });
    }
    
    const currentSymbols = watchlist.symbols || [];
    const upperSymbol = symbol.toUpperCase();
    const updatedSymbols = currentSymbols.filter(s => s !== upperSymbol);
    
    await watchlist.update({ symbols: updatedSymbols });
    
    // Fetch updated watchlist with user info
    const updatedWatchlist = await Watchlist.findByPk(watchlist.id, {
      include: [{
        model: User,
        attributes: ['username', 'email']
      }]
    });
    
    res.status(200).json(updatedWatchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 