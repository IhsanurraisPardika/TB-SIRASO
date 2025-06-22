const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Tampilkan halaman pembayaran
exports.getPembayaran = async (req, res) => {
  const transactionId = parseInt(req.params.id);

  try {
    const transaksi = await prisma.transactions.findUnique({
      where: { transaction_id: transactionId },
    });

    if (!transaksi) {
      return res.status(404).send("Transaksi tidak ditemukan");
    }

    res.render('pembayaran', { transaksi });
  } catch (err) {
    console.error("Gagal ambil data pembayaran:", err);
    res.status(500).send("Internal Server Error");
  }
};

// Proses update metode pembayaran
exports.postPembayaran = async (req, res) => {
  const transactionId = parseInt(req.params.id);
  const metode = req.body.metode_pembayaran;

  try {
    await prisma.transactions.update({
      where: { transaction_id: transactionId },
      data: {
        metode_pembayaran: metode,
      },
    });

    // Redirect ke halaman history (atau halaman lain sesuai kebutuhan)
    res.redirect('/selanjutnya');
  } catch (err) {
    console.error("Gagal update metode pembayaran:", err);
    res.status(500).send("Gagal menyimpan metode pembayaran");
  }
};
