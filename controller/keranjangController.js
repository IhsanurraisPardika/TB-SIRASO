const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getKeranjangByUser = async (req, res) => {
  const userId = req.session.userId || 1; // Untuk demo, ganti dengan auth sesungguhnya
  try {
    const keranjang = await prisma.keranjang.findMany({
      where: { user_id: userId },
      include: {
        menu: true
      }
    });
    
    res.render('keranjang', {
      title: 'Keranjang Belanja',
      items: keranjang
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { error });
  }
};

exports.addToKeranjang = async (req, res) => {
  const userId = req.session.userId || 1;
  const { menu_id, jumlah, waktu_pengambilan } = req.body;
  
  try {
    // Cek stok menu
    const menu = await prisma.menu.findUnique({
      where: { menu_id: parseInt(menu_id) }
    });
    
    if (!menu || menu.stok < jumlah) {
      return res.status(400).json({ error: 'Stok tidak mencukupi' });
    }
    
    // Cek apakah menu sudah ada di keranjang
    const existingItem = await prisma.keranjang.findFirst({
      where: {
        user_id: userId,
        menu_id: parseInt(menu_id)
      }
    });
    
    if (existingItem) {
      // Update jumlah jika sudah ada
      await prisma.keranjang.update({
        where: { keranjang_id: existingItem.keranjang_id },
        data: { 
          jumlah: existingItem.jumlah + parseInt(jumlah),
          waktu_pengambilan: new Date(waktu_pengambilan)
        }
      });
    } else {
      // Tambahkan baru ke keranjang
      await prisma.keranjang.create({
        data: {
          user_id: userId,
          menu_id: parseInt(menu_id),
          jumlah: parseInt(jumlah),
          waktu_pengambilan: new Date(waktu_pengambilan)
        }
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateKeranjangItem = async (req, res) => {
  const { keranjang_id } = req.params;
  const { jumlah } = req.body;
  
  try {
    if (parseInt(jumlah) <= 0) {
      await prisma.keranjang.delete({
        where: { keranjang_id: parseInt(keranjang_id) }
      });
    } else {
      await prisma.keranjang.update({
        where: { keranjang_id: parseInt(keranjang_id) },
        data: { jumlah: parseInt(jumlah) }
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};