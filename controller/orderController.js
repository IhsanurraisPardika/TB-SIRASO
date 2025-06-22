const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getRingkasanPesanan = async (req, res) => {
  try {
    if (!req.session.user) return res.redirect('/login');
    const userId = req.session.user.user_id;
    const keranjang = await req.prisma.keranjang.findMany({
      where: { user_id: userId },
      include: { menu: true },
    });
    if (keranjang.length === 0) {
      return res.status(404).render('ringkasan', { pesanan: [], total: 0, metodePembayaran: '', kodeDiskon: '' });
    }
    const pesanan = keranjang.map((item) => {
      const harga = parseFloat(item.menu.harga);
      const subtotal = harga * item.jumlah;
      return { nama_makanan: item.menu.nama_makanan, jumlah: item.jumlah, harga, subtotal };
    });
    const total = pesanan.reduce((sum, item) => sum + item.subtotal, 0);
    const transaksi = await req.prisma.transactions.findFirst({
      where: { user_id: userId },
      orderBy: { tanggal_transaksi: 'desc' },
    });
    const metodePembayaran = transaksi ? transaksi.metode_pembayaran : '';
    const kodeDiskon = transaksi ? transaksi.kode_diskon : null;
    res.render('ringkasan', { pesanan, total, metodePembayaran, kodeDiskon });
  } catch (err) {
    console.error('Gagal ambil ringkasan:', err);
    res.status(500).render('error', { error: 'Terjadi kesalahan saat mengambil ringkasan pembayaran' });
  }
};

exports.getOrderDetail = async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  try {
    const menu = await req.prisma.menu.findUnique({
      where: { menu_id: parseInt(req.params.id) },
      include: { toko: true },
    });
    if (!menu) {
      return res.status(404).render('error', { message: 'Menu tidak ditemukan' });
    }
    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
    res.render('detailPesanan', { title: `Pesan ${menu.nama_makanan}`, menu, user: req.session.user, formatPrice });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { error });
  }
};
