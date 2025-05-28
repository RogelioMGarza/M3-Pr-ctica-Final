const express = require('express');
const router = express.Router();
const { createMascota } = require('../controllers/mascotaController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/', verifyToken, createMascota);

module.exports = router;