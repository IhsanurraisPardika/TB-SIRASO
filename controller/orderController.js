const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getRingkasanPesanan = async (req, res) => {
  try {
    const userId = 1; // Ganti nanti dengan user login dinamis

    // Ambil isi keranjang user & relasi menu
    const keranjang = await prisma.keranjang.findMany({
      where: { user_id: userId },
      include: { menu: true },
    });

    console.log('Isi Keranjang:', keranjang); // Debug

    const pesanan = keranjang.map((item) => {
      const harga = parseFloat(item.menu.harga); // konversi dari string
      const subtotal = harga * item.jumlah;

      return {
        nama_makanan: item.menu.nama_makanan,
        jumlah: item.jumlah,
        harga,
        subtotal,
      };
    });

    const total = pesanan.reduce((sum, item) => sum + item.subtotal, 0);

    res.render('ringkasan', {
      pesanan,
      total,
      metodePembayaran: 'Bayar di tempat',
      kodeDiskon: null
    });

  } catch (err) {
    console.error('Gagal ambil ringkasan:', err);
    res.status(500).send('Terjadi kesalahan saat mengambil ringkasan pembayaran');
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

        const formatPrice = (price) => {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(price);
        };

        res.render('detailPesanan', {
            title: `Pesan ${menu.nama_makanan}`,
            menu,
            user: req.session.user,
            formatPrice
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { error });
    }
};
