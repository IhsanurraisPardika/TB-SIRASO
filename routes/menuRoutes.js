const express = require('express');
const router = express.Router();
const menuController = require('../controller/menuController');

router.get('/toko/:tokoId', menuController.getMenuByToko);
router.get('/filter/:tokoId/:category', menuController.filterMenuByCategory);

module.exports = router;