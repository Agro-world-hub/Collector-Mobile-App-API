const db = require('../startup/database');

exports.createComplaint = (refNo, status, officerName, farmerName, officerPhone, farmerPhone, complain, language) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO farmerComplains (refNo, status, officerName, farmerName, officerPhone, farmerPhone, complain, language)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [refNo, status, officerName, farmerName, officerPhone, farmerPhone, complain, language];

        db.query(sql, values, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
};
