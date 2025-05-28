const { poolPromise, sql } = require('../config/db');


/**
 * @swagger
 * tags:
 *   name: Citas
 *   description: Gestión de citas veterinarias
 */

/**
 * @swagger
 * /api/citas:
 *   get:
 *     summary: Obtener citas programadas según rol
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de citas obtenida correctamente
 *       403:
 *         description: Rol no permitido
 *       500:
 *         description: Error al obtener citas
 */
exports.getCitas = async (req, res) => {
    const { id, rol } = req.user;
    try {
        const pool = await poolPromise;
        let query;

        if (rol === 'veterinario' || rol === 'admin') {
            query = "SELECT * FROM Citas WHERE estado = 'programada'";
        } else if (rol === 'cliente') {
            query = `
                SELECT c.* FROM Citas c 
                JOIN Mascotas m ON c.mascota_id = m.id 
                JOIN Clientes cl ON m.cliente_id = cl.id 
                WHERE cl.usuario_id = ${id} AND c.estado = 'programada'
            `;
        } else {
            return res.status(403).send('Rol no permitido');
        }

        const result = await pool.request().query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener citas');
    }
};

/**
 * @swagger
 * /api/citas:
 *   post:
 *     summary: Crear una nueva cita
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fecha
 *               - hora
 *               - descripcion
 *               - mascota_id
 *             properties:
 *               fecha:
 *                 type: string
 *                 format: date
 *               hora:
 *                 type: string
 *                 format: time
 *               descripcion:
 *                 type: string
 *               mascota_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Cita creada exitosamente
 *       400:
 *         description: Mascota no válida
 *       500:
 *         description: Error al crear la cita
 */
exports.createCita = async (req, res) => {
    const { id: userId, rol } = req.user;
    const { fecha, hora, descripcion, mascota_id } = req.body;

    try {
        const pool = await poolPromise;

        const validPet = await pool.request()
            .input('mascota_id', sql.Int, mascota_id)
            .query(`SELECT m.id FROM Mascotas m WHERE m.id = @mascota_id`);

        if (validPet.recordset.length === 0) {
            return res.status(400).send('Mascota no válida');
        }

        await pool.request()
            .input('fecha', sql.Date, fecha)
            .input('hora', sql.Time, hora)
            .input('descripcion', sql.VarChar, descripcion)
            .input('mascota_id', sql.Int, mascota_id)
            .input('estado', sql.VarChar, 'programada')
            .query(`
                INSERT INTO Citas (fecha, hora, descripcion, mascota_id, estado)
                VALUES (@fecha, @hora, @descripcion, @mascota_id, @estado)
            `);

        res.status(201).send('Cita creada exitosamente');
    } catch (err) {
        console.error('Error en createCita:', err);
        res.status(500).send('Error al crear la cita');
    }
};

/**
 * @swagger
 * /api/citas/{id}:
 *   put:
 *     summary: Actualizar una cita existente
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la cita
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha:
 *                 type: string
 *                 format: date
 *               hora:
 *                 type: string
 *                 format: time
 *               descripcion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cita actualizada con éxito
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error al actualizar la cita
 */
exports.updateCita = async (req, res) => {
    const { id: userId, rol } = req.user;
    const { id } = req.params;
    const { fecha, hora, descripcion } = req.body;

    try {
        const pool = await poolPromise;

        if (rol === 'cliente') {
            const check = await pool.request().query(`
                SELECT c.id FROM Citas c
                JOIN Mascotas m ON c.mascota_id = m.id
                JOIN Clientes cl ON m.cliente_id = cl.id
                WHERE c.id = ${id} AND cl.usuario_id = ${userId}
            `);
            if (check.recordset.length === 0) {
                return res.status(403).send('No autorizado para editar esta cita');
            }
        }

        await pool.request()
            .input('fecha', sql.Date, fecha)
            .input('hora', sql.Time, hora)
            .input('descripcion', sql.VarChar, descripcion)
            .input('id', sql.Int, id)
            .query(`
                UPDATE Citas
                SET fecha = @fecha, hora = @hora, descripcion = @descripcion
                WHERE id = @id
            `);

        res.send('Cita actualizada con éxito');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al actualizar la cita');
    }
};

/**
 * @swagger
 * /api/citas/{id}:
 *   delete:
 *     summary: Eliminar una cita
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita a eliminar
 *     responses:
 *       200:
 *         description: Cita eliminada con éxito
 *       403:
 *         description: No autorizado para eliminar
 *       500:
 *         description: Error al eliminar la cita
 */
exports.deleteCita = async (req, res) => {
    const { id: userId, rol } = req.user;
    const { id } = req.params;

    try {
        const pool = await poolPromise;

        if (rol === 'cliente') {
            const check = await pool.request().query(`
                SELECT c.id FROM Citas c
                JOIN Mascotas m ON c.mascota_id = m.id
                JOIN Clientes cl ON m.cliente_id = cl.id
                WHERE c.id = ${id} AND cl.usuario_id = ${userId}
            `);
            if (check.recordset.length === 0) {
                return res.status(403).send('No autorizado para eliminar esta cita');
            }
        }

        await pool.request()
            .input('id', sql.Int, id)
            .query(`DELETE FROM Citas WHERE id = @id`);

        res.send('Cita eliminada con éxito');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al eliminar la cita');
    }
};
