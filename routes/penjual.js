const express = require('express');
const router = express.Router();

const penjualController = require('../controller/penjualController');


// Rute GET
router.get('/kelolamenu', penjualController.renderKelolaMenu);
router.get('/tambahmenu', penjualController.renderTambahMenu);

// Rute POST
router.post('/tambahmenu', penjualController.tambahMenu);

module.exports = router;
