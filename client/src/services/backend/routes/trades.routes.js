const express = require('express');
const router = express.Router();
const tradesController = require('../controllers/trades.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Trades routes
router.get('/', tradesController.getAll);
router.get('/:id', tradesController.getById);
router.post('/', tradesController.create);
router.put('/:id', tradesController.update);
router.delete('/:id', tradesController.delete);

module.exports = router; 