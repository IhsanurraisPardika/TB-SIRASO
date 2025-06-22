const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
exports.getMenuByToko = async (req, res) => {
  const { tokoId } = req.params;
  try {
    const allTokos = await req.prisma.toko.findMany();
    const toko = await req.prisma.toko.findUnique({
      where: { toko_id: parseInt(tokoId) },
      include: { menu: { where: { available: true } } }
    });
    if (!toko) {
      return res.status(404).render('error', { error: 'Toko tidak ditemukan', tokos: allTokos });
    }
    res.render('menu', {
      title: `Menu ${toko.nama_toko}`,
      currentToko: toko,
      tokos: allTokos,
      menus: toko.menu
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { error, tokos: await req.prisma.toko.findMany() });
  }
};

exports.filterMenuByCategory = async (req, res) => {
  const { tokoId, category } = req.params;
  try {
    const menus = await req.prisma.menu.findMany({
      where: { toko_id: parseInt(tokoId), kategori: category, available: true }
    });
    res.json(menus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

exports.getMenusApi = async (req, res) => {
  const { toko_id, category } = req.query;
  if (!toko_id) {
    return res.status(400).json({ error: 'Parameter toko_id is required' });
  }
  try {
    const whereClause = { toko_id: parseInt(toko_id), available: true };
    if (category && category !== 'all') {
      whereClause.kategori = category.toLowerCase();
    }
    const menus = await req.prisma.menu.findMany({ where: whereClause, orderBy: { nama_makanan: 'asc' } });
    res.json(menus);
  } catch (error) {
    console.error('Error fetching menus for API:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};