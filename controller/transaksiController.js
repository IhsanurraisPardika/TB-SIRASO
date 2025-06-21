const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit');
const prisma = new PrismaClient();

exports.getDetailPesanan = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const transaksi = await prisma.transactions.findUnique({
      where: { transaction_id: id },
      include: {
        user: true,
      },
    });

    if (!transaksi) {
      return res.status(404).send('Transaksi tidak ditemukan');
    }

    const items = await prisma.keranjang.findMany({
      where: { user_id: transaksi.user_id },
      include: { menu: true },
    });

    const biayaLayanan = 2000;
    const totalBayar = transaksi.total_price + biayaLayanan;

    res.render('detailPesanan', {
      transaksi,
      items,
      biayaLayanan,
      totalBayar,
    });
  } catch (err) {
    console.error('Gagal ambil detail pesanan:', err);
    res.status(500).send('Internal Server Error');
  }
};

exports.cetakBukti = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const transaksi = await prisma.transactions.findUnique({
      where: { transaction_id: id },
      include: {
        user: true,
      },
    });

    const items = await prisma.keranjang.findMany({
      where: { user_id: transaksi.user_id },
      include: { menu: true },
    });

    const biayaLayanan = 2000;
    const totalBayar = transaksi.total_price + biayaLayanan;

    // Buat PDF
    const doc = new PDFDocument({ margin: 50 });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res
        .writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename=bukti_pesanan_${id}.pdf`,
          'Content-Length': pdfData.length,
        })
        .end(pdfData);
    });

    doc.fontSize(18).text('Bukti Pembayaran', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`No. Transaksi : TRX${String(transaksi.transaction_id).padStart(3, '0')}`);
    doc.text(`Nama          : ${transaksi.user.fullname}`);
    doc.text(`Tanggal       : ${transaksi.tanggal_transaksi.toLocaleString('id-ID')}`);
    doc.text(`Metode Bayar  : ${transaksi.metode_pembayaran}`);
    doc.moveDown().text('Detail Pesanan:');

    items.forEach((item) => {
      const subtotal = parseFloat(item.menu.harga) * item.jumlah;
      doc.text(`- ${item.jumlah}x ${item.menu.nama_makanan} = Rp ${subtotal.toLocaleString('id-ID')}`);
    });

    doc.moveDown();
    doc.text(`Biaya Layanan : Rp ${biayaLayanan.toLocaleString('id-ID')}`);
    doc.text(`Total Bayar   : Rp ${totalBayar.toLocaleString('id-ID')}`);
    doc.end();
  } catch (err) {
    console.error('Gagal cetak bukti:', err);
    res.status(500).send('Internal Server Error');
  }
};
