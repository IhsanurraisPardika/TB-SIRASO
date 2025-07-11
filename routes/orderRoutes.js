// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { getRingkasanPesanan } = require('../controller/orderController');
const orderController = require('../controller/orderController');

router.get('/selanjutnya', getRingkasanPesanan);

// Route to get order detail page
router.get('/detail/:id', orderController.getOrderDetail);

module.exports = router;
