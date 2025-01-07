const db = require('../startup/database');

exports.createComplaint = (complain, language, farmerId, category, status) => {
    return new Promise((resolve, reject) => {
        const sql = 
           "INSERT INTO farmercomplains (farmerId,  language, complain, complainCategory, status) VALUES (?, ?, ?, ?, ?)";
        
        const values = [ farmerId,language,complain, category, status];

        db.collectionofficer.query(sql, values, (err, result) => {
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
        db.plantcare.query(sql, [userId], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result[0]); // Returns true if user exists, false otherwise
        });
    });
};

exports.createOfficerComplaint = (coId, language, complain, category, status) => {
    return new Promise((resolve, reject) => {
        const sql = 
           "INSERT INTO farmercomplains (coId,  language, complain, complainCategory, status) VALUES (?, ?, ?, ?, ?)";
        
        const values = [ coId,language,complain, category, status];

        db.collectionofficer.query(sql, values, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
};

exports.getAllComplaintsByUserId = async(userId) => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT id, language, complain, status, createdAt, complainCategory , reply
        FROM farmercomplains 
        WHERE coId = ?
        ORDER BY createdAt DESC
      `;
        db.collectionofficer.query(query, [userId], (error, results) => {
            if (error) {
                console.error("Error fetching complaints:", error);
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};