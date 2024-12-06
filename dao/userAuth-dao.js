const jwt = require("jsonwebtoken");
const db = require("../startup/database");

exports.getOfficerEmployeeId = (empid) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT collectionOfficerId FROM collectionofficercompanydetails WHERE empid = ? ';
        db.query(sql, [empid ], (err, results) => {
            if (err) {
                return reject(new Error('Database error')); // Reject with an error object
            }
            if (results.length === 0) {
                return reject(new Error('Invalid email or password')); // Reject for no results
            }
            resolve(results); // Resolve with the query results
        });
    });
}

exports.getOfficerPasswordBy= (collectionOfficerId, password) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM collectionofficer WHERE id = ? AND password = ?';
        db.query(sql, [collectionOfficerId, password], (err, results) => {
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


exports.updatePasswordInDatabase = (collectionOfficerId, newPassword) => {
    return new Promise((resolve, reject) => {
        const updatePasswordSql = `
            UPDATE collectionofficer
            SET password = ? , passwordUpdated = 1
            WHERE id = ?
        `;
        db.query(updatePasswordSql, [newPassword, collectionOfficerId], (err, result) => {
            if (err) {
                return reject('Database error while updating password');
            }
            resolve(); // Password updated successfully
        });
    });
};