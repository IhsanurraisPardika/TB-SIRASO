const express = require('express');
const router = express.Router();
const keranjangController = require('../controllers/keranjangController');

router.get('/', keranjangController.getKeranjangByUser);
router.post('/add', keranjangController.addToKeranjang);
router.put('/:keranjang_id', keranjangController.updateKeranjangItem);
router.delete('/:keranjang_id', keranjangController.deleteKeranjangItem);

module.exports = router;