const express = require('express');
const router = express.Router();
const menuController = require('../controller/menuController');

// Gunakan controller yang sudah dibuat
router.get('/toko/:toko_id', menuController.getMenuByToko);
router.get('/filter/:toko_id/:category', menuController.filterMenuByCategory);

// Endpoint API untuk AJAX (jika diperlukan)
router.get('/api/by-toko/:toko_id', async (req, res) => {
  try {
    const menus = await prisma.menu.findMany({
      where: { 
        toko_id: parseInt(req.params.toko_id),
        available: true
      }
    });
    res.json({
      success: true,
      data: menus
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Gagal mengambil data menu' 
    });
  }
});

module.exports = router;