const db = require('../startup/database');

exports.createComplaint = (complain, language, farmerId, category, status, officerId, referenceNumber) => {
    return new Promise((resolve, reject) => {
        const sql = 
           "INSERT INTO farmercomplains (farmerId,  language, complain, complainCategory, status, coId, refNo , adminStatus) VALUES (?, ?, ?, ?, ?, ?, ?, 'Assigned')";
        
        const values = [ farmerId,language,complain, category, status, officerId, referenceNumber];

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

exports.createOfficerComplaint = (coId, setlanguage, complain, category, status, referenceNumber,assignedStatus) => {
    return new Promise((resolve, reject) => {
        const sql = 
           "INSERT INTO officercomplains (officerId,  language, complain, complainCategory, status, refNo, complainAssign) VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        const values = [ coId,setlanguage,complain, category, status, referenceNumber,assignedStatus];

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
        SELECT id, language, complain, status, createdAt, complainCategory , reply, refNo
        FROM officercomplains 
        WHERE officerId = ?
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

exports.getComplainCategories = async(appName) => {
    return new Promise((resolve, reject) => {
        const query = `
                   SELECT cc.id, cc.roleId, cc.appId, cc.categoryEnglish, cc.categorySinhala, cc.categoryTamil, ssa.appName
                FROM complaincategory cc
                JOIN systemapplications ssa ON cc.appId = ssa.id
                WHERE ssa.appName = ?
      `;
        db.admin.query(query , [appName], (error, results) => {
            if (error) {
                console.error("Error fetching complaints:", error);
                reject(error);
            } else {
                resolve(results);
                console.log(results)
            }
        });
    });
};

exports.countComplaintsByDate = async (date) => {
    const formattedDate = date.toISOString().split('T')[0]; // Convert date to YYYY-MM-DD

    // Return a promise that resolves the count
    return new Promise((resolve, reject) => {
        const query = `SELECT COUNT(*) AS count FROM farmercomplains WHERE DATE(createdAt) = ?`;
        db.collectionofficer.query(query, [formattedDate], (error, results) => {
            if (error) {
                console.error("Error fetching complaints:", error);
                reject(error);  // Reject the promise on error
            } else {
                resolve(results[0].count);  // Resolve the promise with the count
            }
        });
    });
};

exports.countOfiicerComplaintsByDate = async (date) => {
    const formattedDate = date.toISOString().split('T')[0]; // Convert date to YYYY-MM-DD

    // Return a promise that resolves the count
    return new Promise((resolve, reject) => {
        const query = `SELECT COUNT(*) AS count FROM officercomplains WHERE DATE(createdAt) = ?`;
        db.collectionofficer.query(query, [formattedDate], (error, results) => {
            if (error) {
                console.error("Error fetching complaints:", error);
                reject(error);  // Reject the promise on error
            } else {
                resolve(results[0].count);  // Resolve the promise with the count
            }
        });
    });
};

