const express = require('express');
const router = express.Router();
const { registerUser } = require('../controller/registerController'); // Mengimpor controller untuk registrasi
const bcrypt = require('bcrypt');

// Impor Prisma Client dan inisialisasi
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); // Inisialisasi PrismaClient


// Rute GET untuk halaman login
router.get('/login', (req, res) => {
  res.render('login', { error: null }); // Render halaman login
});

// Rute POST untuk login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Mencari user berdasarkan email
  prisma.user.findUnique({
    where: { email: email }
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

// Rute GET untuk halaman Register
router.get('/register', (req, res) => {
  res.render('register', { error: null }); // Menampilkan halaman registrasi
});

// Rute POST untuk registrasi
router.post('/register', registerUser); // Memanggil controller register untuk proses registrasi

// Rute GET untuk halaman home
router.get('/home', (req, res) => {
  // Cek apakah user sudah login
  if (!req.session.user) {
    return res.redirect('/users/login'); // Jika belum login, redirect ke halaman login
  }
  
  // Render halaman home jika user sudah login
  res.render('home', { user: req.session.user });
});

// Rute POST untuk halaman home (bisa digunakan jika diperlukan untuk handling form setelah login)
router.post('/home', (req, res) => {
  // Proses yang ingin dilakukan setelah login
  // Misalnya, simpan data atau tampilkan pesan sukses
  res.redirect('/users/home'); // Redirect ke halaman home
});

router.get('/menu', async (req, res) => {
    try {
        const Menu = await prisma.menu.findMany();
        console.log(Menu); // Menampilkan data menu di console untuk debugging
        res.json(Menu);
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat mengambil menu' });
    }
});


module.exports = router;
