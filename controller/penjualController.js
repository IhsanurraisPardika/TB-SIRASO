const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Tampilkan halaman tambah menu
const renderTambahMenu = (req, res) => {
  res.render('penjual/tambahmenu');
};

// Tampilkan halaman kelola menu
const renderKelolaMenu = async (req, res) => {
  try {
    const menu = await prisma.menu.findMany();
    res.render('penjual/kelolamenu', { menu });
  } catch (error) {
    console.error(error);
    res.status(500).send('Gagal mengambil data menu.');
  }
};

// Simpan menu ke database
const tambahMenu = async (req, res) => {
  const { nama_makanan, deskripsi, kategori, harga, stok, gambar_url } = req.body;

  try {
    await prisma.menu.create({
      data: {
        nama_makanan,
        deskripsi,
        kategori,
        harga: parseInt(harga),
        stok: parseInt(stok),
        gambar_url,
        rating: 0,
        available: true,
        bahan: '',
        toko_id: 1, // sementara
      },
    });

    res.redirect('/penjual/kelolamenu');
  } catch (error) {
    console.error(error);
    res.status(500).send('Gagal menambahkan menu.');
  }
};

module.exports = {
  renderTambahMenu,
  renderKelolaMenu,
  tambahMenu,
};
