const db = require('../models');
const Trade = db.trades;
const User = db.users;
const { Op } = require('sequelize');

// Get all trades for a user
exports.getAll = async (req, res) => {
  try {
    const trades = await Trade.findAll({
      where: { userId: req.userId },
      include: [{
        model: User,
        attributes: ['username', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json(trades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get trade by ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const trade = await Trade.findOne({
      where: { 
        id,
        userId: req.userId 
      },
      include: [{
        model: User,
        attributes: ['username', 'email']
      }]
    });
    
    if (!trade) {
      return res.status(404).json({ message: 'Trade not found' });
    }
    
    res.status(200).json(trade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new trade
exports.create = async (req, res) => {
  try {
    const { symbol, type, price, quantity, notes } = req.body;
    
    const newTrade = await Trade.create({
      userId: req.userId,
      symbol: symbol.toUpperCase(),
      type,
      price: parseFloat(price),
      quantity: parseFloat(quantity),
      notes,
      status: 'completed',
      tradeDate: new Date()
    });
    
    // Fetch the created trade with user info
    const tradeWithUser = await Trade.findByPk(newTrade.id, {
      include: [{
        model: User,
        attributes: ['username', 'email']
      }]
    });
    
    res.status(201).json(tradeWithUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update trade
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const trade = await Trade.findOne({
      where: { 
        id,
        userId: req.userId 
      }
    });
    
    if (!trade) {
      return res.status(404).json({ message: 'Trade not found' });
    }
    
    await trade.update(updates);
    
    // Fetch updated trade with user info
    const updatedTrade = await Trade.findByPk(id, {
      include: [{
        model: User,
        attributes: ['username', 'email']
      }]
    });
    
    res.status(200).json(updatedTrade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete trade
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await Trade.destroy({
      where: { 
        id,
        userId: req.userId 
      }
    });
    
    if (!deleted) {
      return res.status(404).json({ message: 'Trade not found' });
    }
    
    res.status(200).json({ message: 'Trade deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 