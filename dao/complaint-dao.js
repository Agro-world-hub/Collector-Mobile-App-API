const db = require('../startup/database');

exports.createComplaint = (status,complain, language, farmerId, category) => {
    return new Promise((resolve, reject) => {
        const sql = 
           "INSERT INTO farmercomplains (farmerId,  language, complain, complainCategory, status) VALUES (?, ?, ?, ?, ?)";
        
        const values = [ farmerId,language,complain, category, status];

        db.query(sql, values, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
};

exports.checkIfUserExists = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT id FROM users WHERE id = ?";
        db.query(sql, [userId], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result[0]); // Returns true if user exists, false otherwise
        });
    });
};