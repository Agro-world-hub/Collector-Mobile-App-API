const db = require("../startup/database");

exports.getAllUsers = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id, firstName, lastName, phoneNumber, NICnumber, created_at FROM users';
        db.plantcare.query(sql, (err, results) => {
            if (err) {
                return reject(err); // If there's an error, reject the promise
            }
            resolve(results); // If successful, resolve with the results
            console.log(results);
        });
    });
};

exports.getUsers = (nic) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id, firstName, lastName, phoneNumber, NICnumber, farmerQr, language,route,streetName, city,houseNo, created_at FROM users WHERE NICnumber = ?';
        db.plantcare.query(sql, [nic], (err, results) => {
            if (err) {
                return reject(err); // If there's an error, reject the promise
            }
            resolve(results); // If successful, resolve with the results
            console.log(results);
        });
    });
};

