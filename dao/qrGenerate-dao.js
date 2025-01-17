const db = require('../startup/database');

// Function to fetch user basic information based on phone number
exports.getUserByPhoneNumber = (phoneNumber) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id, firstName, lastName, phoneNumber, NICnumber FROM users WHERE phoneNumber = ?';
    db.plantcare.query(sql, [phoneNumber], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

// Function to fetch bank details based on user ID
exports.getBankDetailsByUserId = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT address, accNumber, accHolderName, bankName, branchName FROM userbankdetails WHERE userId = ?';
    db.plantcare.query(sql, [userId], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};
