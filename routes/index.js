const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const prisma = require('@prisma/client');
const { PrismaClient } = prisma;

// Halaman login
router.get('/login', (req, res) => {
  res.render('login', { error: null }); // Pastikan halaman login render dengan benar
});

// Proses login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Mencari user berdasarkan username
  prisma.user.findUnique({
    where: { username: username }
  })
  .then(user => {
    if (!user) {
      return res.render('login', { error: 'Username tidak ditemukan' });
    }

    // Membandingkan password yang dimasukkan dengan password yang terenkripsi
    bcrypt.compare(password, user.password)
      .then(isMatch => {
        if (isMatch) {
          // Menyimpan data user ke session
          req.session.user = user;

          // Arahkan ke halaman home setelah login sukses
          res.redirect('/users/home');
        } else {
          return res.render('login', { error: 'Password salah' });
        }
      })
      .catch(err => {
        console.error('Error during password comparison:', err);
        res.status(500).send('Internal Server Error');
      });
  })
  .catch(error => {
    console.error('Error during login:', error);
    res.status(500).send('Internal Server Error');
  });
});

// Get untuk halaman home
router.get('/home', (req, res) => {
  // Cek apakah user sudah login
  if (!req.session.user) {
    return res.redirect('/users/login'); // Jika belum login, redirect ke halaman login
  }
  
  // Render halaman home jika user sudah login
  res.render('home', { user: req.session.user });
});

// pencarian
router.get('/pencarian', (req, res) => {
  res.render('pencarian');
});

// Halaman All
router.get('/All', function(req, res, next) {
  res.render('All');
});

// Halaman kategori
router.get('/kategori', function(req, res, next) {
  res.render('kategori');
});

// Halaman jenis
router.get('/jenis', function(req, res, next) {
  res.render('jenis');
});

// Halaman rentang_harga
router.get('/rentang_harga', function(req, res, next) {
  res.render('rentang_harga');
});

// Halaman rating
router.get('/rating', function(req, res, next) {
  res.render('rating');
});

// Halaman populer
router.get('/populer', function(req, res, next) {
  res.render('populer');
});

// Halaman download_menu
router.get('/download_menu', function(req, res, next) {
  res.render('download_menu');
});

// Post untuk register
router.post('/register', (req, res) => {
  const { fullname, username, phone, password, status, alamat, email } = req.body;

  // Cek apakah username sudah ada di database
  prisma.user.findUnique({
    where: { username: username }
  })
  .then(existingUser => {
    if (existingUser) {
      // Jika username sudah ada, beri pesan error
      return res.render('register', { error: 'Username sudah digunakan' });
    }

    // Enkripsi password menggunakan bcrypt
    bcrypt.hash(password, 10)
      .then(hashedPassword => {
        // Menyimpan pengguna baru di database
        prisma.user.create({
          data: {
            fullname: fullname,
            username: username,
            phone: phone,
            password: hashedPassword,  // Simpan password yang sudah terenkripsi
            status: status,
            alamat: alamat,
            email: email,
          },
        })
        .then(newUser => {
          console.log('User created:', newUser);

          // Setelah registrasi berhasil, arahkan ke halaman login
          res.redirect('/users/login');
        })
        .catch(error => {
          console.error('Error during user creation:', error);
          res.status(500).send('Internal Server Error');
        });
      })
      .catch(error => {
        console.error('Error during password hashing:', error);
        res.status(500).send('Internal Server Error');
      });
  })
  .catch(error => {
    console.error('Error during username check:', error);
    res.status(500).send('Internal Server Error');
  });
});

// Rute untuk halaman register
router.get('/register', (req, res) => {
  res.render('register', { error: null }); // Menampilkan halaman registrasi
});

// Arahkan root ke halaman login
router.get('/', (req, res) => {
  res.redirect('/users/login'); // Arahkan root ke halaman login
});

module.exports = router;
