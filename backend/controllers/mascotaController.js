const { poolPromise, sql } = require('../config/db');

exports.createMascota = async (req, res) => {
    const { nombre, especie, raza, edad, peso, cliente_id } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .input('especie', sql.NVarChar, especie)
            .input('raza', sql.NVarChar, raza)
            .input('edad', sql.Int, edad)
            .input('peso', sql.Decimal, peso)
            .input('cliente_id', sql.Int, cliente_id)
            .query(`INSERT INTO Mascotas (nombre, especie, raza, edad, peso, cliente_id)
                    VALUES (@nombre, @especie, @raza, @edad, @peso, @cliente_id)`);
        res.status(201).send('Mascota registrada');
    } catch (err) {
        res.status(500).send('Error al registrar mascota');
    }
};