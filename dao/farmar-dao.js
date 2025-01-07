const db = require('../startup/database');

// Function to insert user data into the database
exports.createUser = (firstName, lastName, NICnumber, phoneNumber) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO users (firstName, lastName, NICnumber, phoneNumber)
            VALUES (?, ?, ?, ?)
        `;
        db.plantcare.query(sql, [firstName, lastName, NICnumber, phoneNumber], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

// Function to insert payment details into the database
exports.createPaymentDetails = (userId, address, accNumber, accHolderName, bankName, branchName) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO userbankdetails (userId, address, accNumber, accHolderName, bankName, branchName)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        db.plantcare.query(sql, [userId, address, accNumber, accHolderName, bankName, branchName], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

// Function to update the QR code file path in the users table
exports.updateQrCodePath = (userId, qrFilePath) => {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE users SET farmerQr = ? WHERE id = ?
        `;
        db.plantcare.query(sql, [qrFilePath, userId], (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};


exports.getFarmerDetailsById = async (userId) => {

    const userSql = `
        SELECT firstName, lastName, NICnumber, farmerQr, phoneNumber
        FROM users 
        WHERE id = ?
    `;
    
    return new Promise((resolve, reject) => {
        db.plantcare.query(userSql, [userId], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        
        });
    });
};


exports.getUserWithBankDetailsById = async (userId) => {
    const query = `
        SELECT 
            u.id AS userId,
            u.firstName,
            u.lastName,
            u.phoneNumber,
            u.NICnumber,
            u.profileImage,
            u.farmerQr,
            b.address,
            b.accNumber,
            b.accHolderName,
            b.bankName,
            b.branchName,
            b.createdAt
        FROM users u
        LEFT JOIN userbankdetails b ON u.id = b.userId
        WHERE u.id = ?;
    `;
    
    return new Promise((resolve, reject) => {
        db.plantcare.query(query, [userId], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};