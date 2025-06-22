const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getToko = async (req, res) => {
  try {
    const toko = await prisma.cafe.findMany();
    res.json(cafes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getTokoById = async (req, res) => {
  const { id } = req.params;
  try {
    const cafe = await prisma.cafe.findUnique({
      where: { id: parseInt(id) },
      include: { menus: true }
    });
    if (!cafe) {
      return res.status(404).json({ error: 'Toko not found' });
    }
    res.json(cafe);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};