const jwt = require("jsonwebtoken");
const db = require("../startup/database");

exports.getOfficerByEmailAndPassword = (email, password) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM collectionofficer WHERE email = ? AND password = ?';
        db.query(sql, [email, password], (err, results) => {
            if (err) {
                return reject(new Error('Database error')); // Reject with an error object
            }
            if (results.length === 0) {
                return reject(new Error('Invalid email or password')); // Reject for no results
            }
            resolve(results); // Resolve with the query results
        });
    });
};
