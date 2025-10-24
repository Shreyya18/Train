const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.PORT
});

db.getConnection()
    .then(() =>
        console.log('Database connected successfully'))
    .catch(err =>
        console.log('Database connection failed: ', err));


module.exports = db;