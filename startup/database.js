const mysql = require('mysql2'); // Use the promise version
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const connectToDatabase = async() => {
    try {
        await db.connect();
        console.log('Connected to the MySQL database.');
    } catch (err) {
        console.error('Error connecting to the database:', err);
    }
};

connectToDatabase();

module.exports = db;