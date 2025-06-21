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

// Hapus menu
const hapusMenu = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.menu.delete({
      where: {
        menu_id: parseInt(id),
      },
    });
    res.redirect('/penjual/kelolamenu');
  } catch (error) {
    console.error(error);
    res.status(500).send('Gagal menghapus menu.');
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

// Tampilkan form edit
const renderEditMenu = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const menu = await prisma.menu.findUnique({ where: { menu_id: id } });
    res.render('penjual/editmenu', { menu });
  } catch (err) {
    console.error(err);
    res.status(500).send('Gagal menampilkan data menu.');
  }
};

// Proses update menu
const updateMenu = async (req, res) => {
  const id = parseInt(req.params.id);
  const { nama_makanan, deskripsi, kategori, harga, stok, gambar_url } = req.body;

  try {
    await prisma.menu.update({
      where: { menu_id: id },
      data: {
        nama_makanan,
        deskripsi,
        kategori,
        harga: parseInt(harga),
        stok: parseInt(stok),
        gambar_url,
      },
    });
    res.redirect('/penjual/kelolamenu');
  } catch (err) {
    console.error(err);
    res.status(500).send('Gagal mengupdate menu.');
  }
};

// Export semua fungsi
module.exports = {
  renderTambahMenu,
  renderKelolaMenu,
  tambahMenu,
  hapusMenu,
  renderEditMenu,
  updateMenu,
};
