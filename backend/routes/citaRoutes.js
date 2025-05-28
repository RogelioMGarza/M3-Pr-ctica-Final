const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const {
    getCitas,
    createCita,
    updateCita,
    deleteCita
} = require('../controllers/citaController');

router.get('/', verifyToken, getCitas);
router.post('/', verifyToken, createCita);
router.put('/:id', verifyToken, updateCita);
router.delete('/:id', verifyToken, deleteCita);

module.exports = router;
