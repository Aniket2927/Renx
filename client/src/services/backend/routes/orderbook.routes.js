const express = require('express');
const router = express.Router();
const orderbookController = require('../controllers/orderbook.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Orderbook routes (public)
router.get('/:symbol', orderbookController.get);

// Protected routes (require authentication)
router.use(authMiddleware);
router.post('/orders', orderbookController.placeOrder);
router.delete('/orders/:orderId', orderbookController.cancelOrder);
router.get('/orders/user', orderbookController.getUserOrders);

module.exports = router; 