const express = require('express');
const router = express.Router();

const penjualController = require('../controller/penjualController');


// Rute GET
router.get('/kelolamenu', penjualController.renderKelolaMenu);
router.get('/tambahmenu', penjualController.renderTambahMenu);

// Rute POST
router.post('/tambahmenu', penjualController.tambahMenu);

//hapus menu
router.post('/hapusmenu/:id', penjualController.hapusMenu);

// Tampilkan form edit menu
router.get('/editmenu/:id', penjualController.renderEditMenu);

// Proses update menu
router.post('/editmenu/:id', penjualController.updateMenu);

module.exports = router;
