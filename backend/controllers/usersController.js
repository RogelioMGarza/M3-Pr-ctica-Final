const { poolPromise, sql } = require('../config/db');

/**
 * Obtener todos los usuarios
 */
const getUsers = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT id, nombre, correo, contrasena_hash, rol FROM Usuarios');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Obtener un usuario por ID
 */
const getUserById = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT id, nombre, correo, rol FROM Usuarios WHERE id = @id');
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Crear nuevo usuario
 */
const createUser = async (req, res) => {
  const { nombre, correo, contrasena_hash, rol } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('nombre', sql.NVarChar, nombre)
      .input('correo', sql.NVarChar, correo)
      .input('contrasena_hash', sql.NVarChar, contrasena_hash)
      .input('rol', sql.NVarChar, rol)
      .query('INSERT INTO Usuarios (nombre, correo, contrasena_hash, rol) VALUES (@nombre, @correo, @contrasena_hash, @rol)');
    res.status(201).json({ message: 'Usuario creado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Actualizar un usuario existente
 */
const updateUser = async (req, res) => {
  const { nombre, correo, contrasena_hash, rol } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('nombre', sql.NVarChar, nombre)
      .input('correo', sql.NVarChar, correo)
      .input('contrasena_hash', sql.NVarChar, contrasena_hash)
      .input('rol', sql.NVarChar, rol)
      .query(`UPDATE Usuarios 
              SET nombre = @nombre, correo = @correo, contrasena_hash = @contrasena_hash, rol = @rol 
              WHERE id = @id`);
    res.json({ message: 'Usuario actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Eliminar un usuario por ID
 */
const deleteUser = async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Usuarios WHERE id = @id');
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
