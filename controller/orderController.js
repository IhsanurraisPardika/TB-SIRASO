const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getRingkasanPesanan = async (req, res) => {
  try {
    const userId = 1; // Ganti nanti dengan user login dinamis

    // Ambil isi keranjang user & menu
    const keranjang = await prisma.keranjang.findMany({
      where: { user_id: userId },
      include: { menu: true },
    });

    if (keranjang.length === 0) {
      return res.status(404).send('Keranjang kosong.');
    }

    const pesanan = keranjang.map((item) => {
      const harga = parseFloat(item.menu.harga);
      const subtotal = harga * item.jumlah;

      return {
        nama_makanan: item.menu.nama_makanan,
        jumlah: item.jumlah,
        harga,
        subtotal,
      };
    });

    const total = pesanan.reduce((sum, item) => sum + item.subtotal, 0);

    // ✅ Ambil transaksi terakhir user (bisa difilter lebih spesifik jika perlu)
    const transaksi = await prisma.transactions.findFirst({
      where: { user_id: userId },
      orderBy: { tanggal_transaksi: 'desc' },
    });

    if (!transaksi) {
      return res.status(404).send('Transaksi tidak ditemukan.');
    }

    // Ambil metode pembayaran dari transaksi
    const metodePembayaran = transaksi.metode_pembayaran;
    const kodeDiskon = transaksi.kode_diskon || null;

    // Render ke halaman EJS
    res.render('ringkasan', {
      pesanan,
      total,
      metodePembayaran,
      kodeDiskon,
    });

  } catch (err) {
    console.error('Gagal ambil ringkasan:', err);
    res.status(500).send('Terjadi kesalahan saat mengambil ringkasan pembayaran');
  }
};
