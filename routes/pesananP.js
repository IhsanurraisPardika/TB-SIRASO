const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/pesanan', async (req, res) => { // ✅ cukup "/pesanan" saja
  try {
    const tokoId = 1;

    const semuaTransaksi = await prisma.transactions.findMany({
      include: {
        user: true
      },
      orderBy: {
        tanggal_transaksi: 'desc'
      }
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
        include: {
          menu: true
        }
      });

      if (keranjang.length > 0) {
        hasilTransaksi.push({
          ...trx,
          pesananMenu: keranjang
        });
      }
    }

    res.render('penjual/pesananP', { transaksi: hasilTransaksi });

  } catch (error) {
    console.error(error);
    res.status(500).send('Gagal mengambil data transaksi');
  }
});

module.exports = router;
