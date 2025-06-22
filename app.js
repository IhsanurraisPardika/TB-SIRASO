const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const port = 3000;
const prisma = new PrismaClient();

// Import rute yang diperlukan
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const orderRoutes = require('./routes/orderRoutes');
const transaksiRoutes = require('./routes/transaksiRoutes');
const menuRoutes = require('./routes/menuRoutes'); 
const apiMenuRoutes = require('./routes/menuRoutes');


// Konfigurasi view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware session
app.use(session({
  secret: process.env.SESSION_SECRET || 'rahasia',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Membuat Prisma client tersedia untuk semua rute
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Rute-rute aplikasi
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/order', orderRoutes);
app.use('/transaksi', transaksiRoutes);
app.use('/menu', menuRoutes);



// Rute login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: 'User tidak ditemukan' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Password salah' });
    }

    req.session.userId = user.user_id;
    req.session.user = user;
    res.redirect('/home');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login gagal, coba lagi.' });
  }
});

// Rute home yang sudah diperbaiki
app.get('/home', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/users/login');
  }

  try {
    // Ambil semua data cafe
    const tokos = await prisma.toko.findMany();
    const { toko_id } = req.query;

    let currentToko = null;
    let menus = [];

    if (toko_id) {
      // Ambil data cafe yang dipilih
      currentToko = await prisma.toko.findUnique({
        where: { toko_id: parseInt(toko_id) }
      });

      // Jika cafe ditemukan, ambil menunya
      if (currentToko) {
        menus = await prisma.menu.findMany({
          where: { 
            toko_id: parseInt(toko_id),
            available: true
          },
          orderBy: { menu_id: 'asc' }
        });
      }
    }

    res.render('home', {
      userId: req.session.userId,
      user: req.session.user,
      tokos: tokos,
      currentToko: currentToko,
      menus: menus,
      formatPrice: (price) => {
        return new Intl.NumberFormat('id-ID', { 
          style: 'currency', 
          currency: 'IDR',
          minimumFractionDigits: 0
        }).format(price);
      }
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).render('error', { 
      error: 'Terjadi kesalahan saat memuat data',
      message: error.message 
    });
  }
});

// Penanganan error
app.use(function(req, res, next) {
  const err = new Error('Halaman Tidak Ditemukan');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

module.exports = app;