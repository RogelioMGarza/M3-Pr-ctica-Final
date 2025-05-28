const sql = require('mssql');

const dbConfig = {
    user: 'db_a25c05_sapitos_admin',
    password: 'momju6-baTnax-rusxyq',
    server: 'sql8020.site4now.net',
    database: 'db_a25c05_sapitos',
    options: {
        encrypt: true
    }
};

const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log('Conectado a SQL Server');
        return pool;
    })
    .catch(err => console.log('Error al conectar DB:', err));

module.exports = {
    sql,
    poolPromise
};