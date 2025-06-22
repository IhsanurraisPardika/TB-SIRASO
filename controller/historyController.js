const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getHistory = async (req, res) => {
  try {
    const transaksi = await prisma.transactions.findMany({
      orderBy: { tanggal_transaksi: 'desc' },
      include: {
        user: true,
        pickup_schedule: true,
        refundRequests: true,
      },
    });

    res.render('history', { transaksi });
  } catch (err) {
    console.error('Gagal ambil history:', err);
    res.status(500).send("Gagal mengambil riwayat transaksi.");
  }
};
