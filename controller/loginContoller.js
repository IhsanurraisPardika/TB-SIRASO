const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

// Fungsi untuk login
const loginUser = async (req, res) => {
  // Validasi form input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('login', { error: errors.array().map(err => err.msg).join(", ") }); // Menampilkan semua error
  }

  const { username, password } = req.body;

  try {
    // Mencari user berdasarkan username
    const user = await req.prisma.user.findUnique({
      where: { username: username },
    });

    // Jika user tidak ditemukan
    if (!user) {
      return res.render('login', { error: 'Username atau password salah' });
    }

    // Membandingkan password yang diinput dengan yang ada di database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // Jika password tidak valid
    if (!isPasswordValid) {
      return res.render('login', { error: 'Username atau password salah' });
    }

    // Jika login berhasil, simpan user ke session
    req.session.user = user;

    // Arahkan ke halaman home setelah login sukses
    res.redirect('/home');
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Terjadi kesalahan pada server.');
  }
};

module.exports = { loginUser };
