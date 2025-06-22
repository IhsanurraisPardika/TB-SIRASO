const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');


const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();
const {PrismaClient} = require('@prisma/client'); // Mengimpor Prisma Client
const orderRoutes = require('./routes/orderRoutes');
const transaksiRoutes = require('./routes/transaksiRoutes');
const refundRoutes = require('./routes/refundRoutes');  // pastikan path-nya sesuai
const historyRoutes = require('./routes/historyRoutes');
const paymentRoutes = require('./routes/paymentRoutes');


const app = express();
const port = 3000;
const prisma = new PrismaClient();

// Import rute yang diperlukan
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const orderRoutes = require('./routes/orderRoutes');
const transaksiRoutes = require('./routes/transaksiRoutes');
const menuRoutes = require('./routes/menuRoutes');
const keranjangRoutes = require('./routes/keranjangRoutes');
const apiRoutes = require('./routes/apiRoutes');

require('dotenv').config(); // Menggunakan dotenv untuk mengelola variabel lingkungan


// Konfigurasi view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routing dasar
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const penjualRouter = require('./routes/penjual');
const pesananPRouter = require('./routes/pesananP');

app.use('/', indexRouter);
app.use('/users', usersRouter);


// Routing penjual (Kelola Menu, Pesanan, dll)
app.use('/penjual', penjualRouter);     // rute seperti /penjual/kelolamenu
app.use('/penjual/pesanan', pesananPRouter);    // rute seperti /penjual/pesanan

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


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


// Routing untuk halaman utama dan login
app.use('/', indexRouter);  // Menggunakan rute untuk halaman utama
app.use('/users', usersRouter); // Menggunakan rute untuk login dan registrasi
app.use('/', orderRoutes);
app.use('/', transaksiRoutes);
app.use('/', refundRoutes);// Menggunakan routes untuk refund
app.use('/history', historyRoutes); // history
app.use('/pembayaran', paymentRoutes);

// Login route (dummy)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } }); // ✅ pakai findUnique
    if (!user) return res.status(400).json({ error: 'User tidak ditemukan' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ error: 'Password salah' });

    req.session.userId = user.id; // Simpan ID saja, lebih aman
    res.redirect('/home');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login gagal' });
  }
});

// Home route
app.get('/home', (req, res) => {
  if (!req.session.userId) return res.redirect('/users/login');
  res.render('home', { userId: req.session.userId });
});

// Auth routes
app.get('/users/login', (req, res) => res.render('login'));
app.get('/users/register', (req, res) => res.render('register'));

// Error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');

// Halaman login
app.get('/users/login', (req, res) => {
  res.render('login');
});

// Halaman register
app.get('/users/register', (req, res) => {
  res.render('register');
});

// Halaman pesanan
app.get('/users/pesanan', (req, res) => {
  // Cek apakah user sudah login
  if (!req.session.userId) {
    return res.redirect('/users/login'); // Jika belum login, alihkan ke halaman login
  }

  // Menampilkan halaman pesanan jika user sudah login
  res.render('pesanan', { userId: req.session.userId });

});

// Rute-rute aplikasi
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/order', orderRoutes);
app.use('/transaksi', transaksiRoutes);
app.use('/menu', menuRoutes);
app.use('/keranjang', keranjangRoutes);
app.use('/api', apiRoutes);


// Server start
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