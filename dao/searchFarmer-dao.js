const db = require("../startup/database");

exports.getAllUsers = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id, firstName, lastName, phoneNumber, NICnumber, created_at FROM users';
        db.plantcare.query(sql, (err, results) => {
            if (err) {
                return reject(err); // If there's an error, reject the promise
            }
            resolve(results); // If successful, resolve with the results
        });
    });
};