const db = require('../models');
const Order = db.orders;
const User = db.users;
const { Op } = require('sequelize');

// Get orderbook for a symbol
exports.get = async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const orders = await Order.findAll({
      where: { 
        symbol: symbol.toUpperCase(),
        status: 'open'
      },
      include: [{
        model: User,
        attributes: ['username']
      }],
      order: [
        ['side', 'ASC'], // buy orders first, then sell orders
        ['price', 'DESC'] // highest price first for buy, lowest for sell
      ]
    });
    
    // Separate buy and sell orders
    const buyOrders = orders.filter(order => order.side === 'buy');
    const sellOrders = orders.filter(order => order.side === 'sell');
    
    // Sort sell orders by price (ascending for sell orders)
    sellOrders.sort((a, b) => a.price - b.price);
    
    res.status(200).json({
      symbol: symbol.toUpperCase(),
      bids: buyOrders,
      asks: sellOrders,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Place a new order
exports.placeOrder = async (req, res) => {
  try {
    const { symbol, type, side, price, quantity, stopPrice } = req.body;
    
    // Validate required fields
    if (!symbol || !type || !side || !quantity) {
      return res.status(400).json({ 
        message: 'Symbol, type, side, and quantity are required' 
      });
    }
    
    // Validate price for limit orders
    if (type === 'limit' && !price) {
      return res.status(400).json({ 
        message: 'Price is required for limit orders' 
      });
    }
    
    const newOrder = await Order.create({
      userId: req.userId,
      symbol: symbol.toUpperCase(),
      type,
      side,
      price: price ? parseFloat(price) : null,
      stopPrice: stopPrice ? parseFloat(stopPrice) : null,
      quantity: parseFloat(quantity),
      status: 'open',
      filledQuantity: 0
    });
    
    // Fetch the created order with user info
    const orderWithUser = await Order.findByPk(newOrder.id, {
      include: [{
        model: User,
        attributes: ['username', 'email']
      }]
    });
    
    res.status(201).json(orderWithUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel an order
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({
      where: {
        id: orderId,
        userId: req.userId,
        status: 'open'
      }
    });
    
    if (!order) {
      return res.status(404).json({ 
        message: 'Order not found or cannot be cancelled' 
      });
    }
    
    await order.update({ status: 'canceled' });
    
    // Fetch updated order with user info
    const updatedOrder = await Order.findByPk(orderId, {
      include: [{
        model: User,
        attributes: ['username', 'email']
      }]
    });
    
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const { status } = req.query;
    
    const whereClause = { userId: req.userId };
    if (status) {
      whereClause.status = status;
    }
    
    const orders = await Order.findAll({
      where: whereClause,
      include: [{
        model: User,
        attributes: ['username', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 