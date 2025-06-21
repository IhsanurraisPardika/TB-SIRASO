// routes/pesanan.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('pesanan', { active: 'pesanan' }); // Pastikan 'pesanan.ejs' ada di folder 'views'
});

module.exports = router;
