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
const keranjangRoutes = require('./routes/keranjangRoutes');
const apiRoutes = require('./routes/apiRoutes');

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
app.use('/keranjang', keranjangRoutes);
app.use('/api', apiRoutes);

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

module.exports = app;