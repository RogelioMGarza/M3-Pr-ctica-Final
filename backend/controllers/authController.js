const { poolPromise, sql } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Endpoints para autenticación de usuarios
 */

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *               - contrasena
 *             properties:
 *               correo:
 *                 type: string
 *                 format: email
 *               contrasena:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 rol:
 *                   type: string
 *       401:
 *         description: Contraseña incorrecta
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
exports.login = async (req, res) => {
  const { correo, contrasena } = req.body;
  console.log("🟡 LOGIN REQUEST:", correo, contrasena);

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('correo', sql.NVarChar, correo)
      .query('SELECT * FROM Usuarios WHERE correo = @correo');

    if (result.recordset.length === 0) {
      console.log("🔴 Usuario no encontrado");
      return res.status(404).send('Usuario no encontrado');
    }

    const user = result.recordset[0];
    console.log("🟢 Usuario encontrado:", user.correo);
    console.log("🧪 Hash guardado:", user.contrasena_hash);

    const isValid = await bcrypt.compare(contrasena, user.contrasena_hash);
    console.log("🧪 Comparación:", isValid);

    if (!isValid) {
      console.log("🔴 Contraseña incorrecta");
      return res.status(401).send('Contraseña incorrecta');
    }

    const token = jwt.sign({ id: user.id, rol: user.rol }, JWT_SECRET, { expiresIn: '1d' });
    console.log("✅ Login exitoso, enviando token");
    res.json({ token, rol: user.rol });

  } catch (err) {
    console.error("❌ Error en login:", err);
    res.status(500).send('Error en login');
  }
};
