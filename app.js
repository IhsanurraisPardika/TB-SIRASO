const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const {PrismaClient} = require('@prisma/client'); // Mengimpor Prisma Client
const orderRoutes = require('./routes/orderRoutes');
const transaksiRoutes = require('./routes/transaksiRoutes');

const app = express();
const port = 3000; // Port yang akan digunakan oleh server

// Mengimpor routing
const indexRouter = require('./routes/index'); 
const usersRouter = require('./routes/users'); 
require('dotenv').config(); // Menggunakan dotenv untuk mengelola variabel lingkungan


app.post("/addUsers", async (req, res) => {
  const user = req.body; // Mengambil data user dari request body
  const result = await prisma.user.create({
    data: user // Menyimpan data user ke database
  })
  res.send(result)
});  

app.use(session({
  secret: process.env.SESSION_SECRET, // Mengambil secret dari .env
  resave: false,
  saveUninitialized: true,
}));

// View engine setup
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
  secret: 'ihsan',  // Ganti dengan kunci yang lebih aman
  resave: false,
  saveUninitialized: true,
}));


// Routing untuk halaman utama dan login
app.use('/', indexRouter);  // Menggunakan rute untuk halaman utama
app.use('/users', usersRouter); // Menggunakan rute untuk login dan registrasi
app.use('/', orderRoutes);
app.use('/', transaksiRoutes);

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Mencari pengguna berdasarkan email
    const user = await prisma.user({ email });

    // Jika user tidak ditemukan
    if (!user) {
      return res.status(400).json({ error: 'User tidak ditemukan' });
    }

    // Memverifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Password salah' });
    }

    // Mengatur session setelah login berhasil
    req.session.user = user; // Menyimpan user ke session

    // Redirect ke halaman home setelah login berhasil
    res.redirect('/home');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login gagal, coba lagi.' });
  }
});

// Home route
app.get('/home', (req, res) => {
  // Cek apakah user sudah login
  if (!req.session.userId) {
    return res.redirect('/users/login'); // Jika belum login, alihkan ke halaman login
  }

  // Menampilkan halaman home jika user sudah login
  res.render('home', { userId: req.session.userId });
});

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


// Error handling
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});






// Menjalankan server di localhost:3000
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

module.exports = app;
