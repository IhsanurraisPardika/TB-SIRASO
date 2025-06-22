const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const penjualController = require('../controller/penjualController');


// GET: Tampilkan form login penjual
router.get('/login', (req, res) => {
  res.render('penjual/loginPenjual', { error: null });
});

// POST: Proses login penjual
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const seller = await prisma.seller.findUnique({ where: { username } });

    if (!seller || seller.password !== password) {
      return res.render('penjual/loginPenjual', { error: 'Username atau password salah' });
    }

    req.session.seller = seller; // Set session penjual
    res.redirect('/penjual/kelolamenu');
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Terjadi kesalahan saat login');
  }
});



// ==== ROUTE PESANAN (dari pesananP.js) ====
router.get('/pesanan', async (req, res) => {
  try {
    const tokoId = 1;

    const semuaTransaksi = await prisma.transactions.findMany({
      include: { user: true },
      orderBy: { tanggal_transaksi: 'desc' }
    });

    const hasilTransaksi = [];

    for (let trx of semuaTransaksi) {
      const keranjang = await prisma.keranjang.findMany({
        where: {
          user_id: trx.user_id,
          menu: {
            toko_id: tokoId
          }
        },
        include: { menu: true }
      });

      if (keranjang.length > 0) {
        hasilTransaksi.push({
          ...trx,
          pesananMenu: keranjang
        });
      }
    }

    res.render('penjual/pesananP', {
  transaksi: hasilTransaksi,
  activePage: 'pesanan'
});


  } catch (error) {
    console.error(error);
    res.status(500).send('Gagal mengambil data transaksi');
  }
});

// ==== ROUTE KELOLA MENU (yang sudah kamu punya) ====
router.get('/kelolamenu', penjualController.renderKelolaMenu);
router.get('/tambahmenu', penjualController.renderTambahMenu);
router.post('/tambahmenu', penjualController.tambahMenu);
router.post('/hapusmenu/:id', penjualController.hapusMenu);
router.get('/editmenu/:id', penjualController.renderEditMenu);
router.post('/editmenu/:id', penjualController.updateMenu);

// router.get('/kelolamenu', async (req, res) => {
//   try {
//     const menu = await prisma.menu.findMany();
//     res.render('penjual/kelolamenu', { menu, activePage: 'kelolamenu' });
//   } catch (error) {
//     console.error("Gagal mengambil data menu:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });


module.exports = router;
