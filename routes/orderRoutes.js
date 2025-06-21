// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { getRingkasanPesanan } = require('../controller/orderController');

router.get('/selanjutnya', getRingkasanPesanan);

module.exports = router;
