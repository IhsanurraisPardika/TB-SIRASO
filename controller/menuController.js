const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getMenuByToko = async (req, res) => {
  const { toko_id } = req.params; // Ubah dari tokoId ke toko_id untuk konsistensi
  try {
    // Dapatkan semua toko untuk sidebar
    const allTokos = await prisma.toko.findMany();
    
    const toko = await prisma.toko.findUnique({
      where: { toko_id: parseInt(toko_id) },
      include: { 
        menu: {
          where: { available: true } // Ubah dari string 'true' ke boolean true
        }
      }
    });
    
    if (!toko) {
      return res.status(404).render('error', { 
        error: 'Toko tidak ditemukan',
        tokos: allTokos // Tetap kirim data toko untuk sidebar
      });
    }
    
    res.render('menu', {
      title: `Menu ${toko.nama_toko}`,
      currentToko: toko,
      tokos: allTokos,
      menus: toko.menu
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { 
      error,
      tokos: await prisma.toko.findMany() // Tetap kirim data toko saat error
    });
  }
};

exports.filterMenuByCategory = async (req, res) => {
  const { toko_id, category } = req.params; // Ubah parameter ke toko_id
  try {
    const menus = await prisma.menu.findMany({
      where: { 
        toko_id: parseInt(toko_id),
        kategori: category,
        available: true // Ubah ke boolean
      }
    });
    res.json(menus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      error: 'Internal Server Error' 
    });
  }
};