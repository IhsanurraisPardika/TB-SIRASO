const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const prisma = require('@prisma/client');
const { PrismaClient } = prisma;

const PDFDocument = require('pdfkit');
const fs = require('fs');

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

// Halaman pencarian
router.get('/pencarian', function(req, res, next) {
  res.render('pencarian');
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

// Rute untuk halaman pesanan
router.get('/pesanan', async (req, res) => {  
  res.render('pesanan', { Menu: Menu, jumlah: jumlah }); // Kirim data ke halaman pesanan
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


router.post('/keranjang', async (req, res) => {
    const { userId, menuId, jumlah, waktuPengambilan } = req.body;

    try {
    // menambahkan makanan dalam keranjang
        const keranjang = await prisma.keranjang.create({
            data: {
                userId: userId,
                menuId: menuId,
                jumlah: jumlah,
                waktuPengambilan: new Date (waktuPengambilan),
            },
        });
        res.json(keranjang); // Mengembalikan data keranjang yang baru dibuat
    } catch (error) {
      res.status(500).json({ error: 'Gagal menambahkan makanan ke keranjang' });
    }
});

router.post('/transaksi', async (req, res) => {
    const { userId, keranjangIds } = req.body;

    try {
      const transaksi = await prisma.transaction.create({
        data: {
          user_id:userId, 
          status: 'dipesan',
        },
      });

      // menambahkan item ke transaksi
      for (const keranjangId of keranjangIds) {
            const keranjang = await prisma.keranjang.findUnique({ where: { keranjang_id: keranjangId } });
            
            await prisma.detail_transaksi.create({
                data: {
                    transaksi_id: transaksi.transaction_id,
                    menu_id: keranjang.menu_id,
                    jumlah: keranjang.jumlah,
                    harga: keranjang.jumlah * (await prisma.menu.findUnique({ where: { menu_id: keranjang.menu_id } })).harga,
                },
            });
        }
        
        res.json({ message: 'Transaksi berhasil diproses', transaksi });
    } catch (error) {
        res.status(500).json({ error: 'Gagal memproses transaksi' });
    }
});

// Memeriksa status pesanan
router.get('/status/:transactionId', async (req, res) => {
    const { transactionId } = req.params;
    
    try {
        const transaksi = await prisma.transactions.findUnique({
            where: { transaction_id: parseInt(transactionId) },
            include: {
                detail_transaksi: true, // Menampilkan detail transaksi (makanan yang dipesan)
            },
        });
        
        if (!transaksi) {
            return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
        }
        
        res.json({
            status: transaksi.status,
            nomor_antrian: transaksi.nomor_antrian, // Anda bisa menambahkan logika untuk nomor antrian
            detail_transaksi: transaksi.detail_transaksi,
        });
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil status pesanan' });
    }
});

// Menggenerate PDF untuk pesanan
router.get('/generate-pdf/:transactionId', async (req, res) => {
    const { transactionId } = req.params;
    
    try {
        const transaksi = await prisma.transactions.findUnique({
            where: { transaction_id: parseInt(transactionId) },
            include: { detail_transaksi: true },
        });
        
        if (!transaksi) {
            return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
        }

        const doc = new PDFDocument();
        const filePath = `./public/pesanan_${transactionId}.pdf`;
        doc.pipe(fs.createWriteStream(filePath));
        
        doc.fontSize(12).text(`Pesanan ID: ${transaksi.transaction_id}`);
        doc.text(`Status: ${transaksi.status}`);
        doc.text(`Waktu Pengambilan: ${transaksi.waktu_pengambilan}`);
        doc.text('Detail Pesanan:');
        
        transaksi.detail_transaksi.forEach((item, index) => {
            doc.text(`${index + 1}. ${item.menu_id} - ${item.jumlah}x`);
        });
        
        doc.end();
        
        res.json({ message: 'PDF berhasil dibuat', filePath });
    } catch (error) {
        res.status(500).json({ error: 'Gagal membuat PDF' });
    }
});

router.get('/pesanan', (req, res) => {
  console.log('Session user:', req.session.user);  // Menampilkan data user yang ada di session
  // Cek apakah user sudah login
  if (!req.session.user) {
    return res.redirect('/users/login'); // Jika belum login, redirect ke halaman login
  }

  // Render halaman pesanan jika user sudah login
  res.render('pesanan', { user: req.session.user });
});

router.post('/pesanan', async (req, res) => {
  res.render('pesanan', { user: req.session.user }); // Render halaman pesanan dengan data user
});

module.exports = router;
