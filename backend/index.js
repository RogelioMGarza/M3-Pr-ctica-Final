const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sql = require('mssql');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Swagger
const { swaggerUi, specs } = require('./swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Configuración base de datos
const dbConfig = {
    user: 'db_a25c05_sapitos_admin',
    password: 'momju6-baTnax-rusxyq',
    server: 'sql8020.site4now.net',
    database: 'db_a25c05_sapitos',
    options: { encrypt: true }
};

const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log('Conectado a SQL Server');
        return pool;
    })
    .catch(err => console.log('Error al conectar DB:', err));
    
app.set('poolPromise', poolPromise);
app.set('sql', sql);

// Middleware de autenticación
const verifyToken = require('./middleware/authMiddleware');

const usersRoutes = require('./routes/users.routes');
app.use('/users', usersRoutes);


// Rutas externas
const citasRoutes = require('./routes/citaRoutes');
app.use('/api/citas', citasRoutes);

// Login
app.post('/api/login', async (req, res) => {
    const { correo, contrasena } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('correo', sql.NVarChar, correo)
            .query('SELECT * FROM Usuarios WHERE correo = @correo');

        if (result.recordset.length === 0) return res.status(404).send('Usuario no encontrado');

        const user = result.recordset[0];
        const isValid = await bcrypt.compare(contrasena, user.contrasena_hash);
        if (!isValid) return res.status(401).send('Contraseña incorrecta');

        const token = jwt.sign({ id: user.id, rol: user.rol }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, rol: user.rol });
    } catch (err) {
        res.status(500).send('Error en login');
    }
});

// Registro
app.post('/api/register', async (req, res) => {
    const { nombre, correo, contrasena, rol } = req.body;
    try {
        const hash = await bcrypt.hash(contrasena, 10);
        const pool = await poolPromise;
        await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .input('correo', sql.NVarChar, correo)
            .input('contrasena_hash', sql.NVarChar, hash)
            .input('rol', sql.NVarChar, rol)
            .query('INSERT INTO Usuarios (nombre, correo, contrasena_hash, rol) VALUES (@nombre, @correo, @contrasena_hash, @rol)');
        res.status(201).send('Usuario registrado');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al registrar usuario');
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en puerto ${PORT}`);
});
