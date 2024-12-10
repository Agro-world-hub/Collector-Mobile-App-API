const db = require("../startup/database");

exports.getOfficerEmployeeId = (empid) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT collectionOfficerId FROM collectionofficercompanydetails WHERE empid = ? ";
    db.query(sql, [empid], (err, results) => {
      if (err) {
        return reject(new Error("Database error")); // Reject with an error object
      }
      if (results.length === 0) {
        return reject(new Error("Invalid email or password")); // Reject for no results
      }
      resolve(results); // Resolve with the query results
    });
  });
};

exports.getOfficerPasswordBy = (collectionOfficerId, password) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM collectionofficer WHERE id = ? AND password = ?";
    db.query(sql, [collectionOfficerId, password], (err, results) => {
      if (err) {
        return reject(new Error("Database error")); // Reject with an error object
      }
      if (results.length === 0) {
        return reject(new Error("Invalid email or password")); // Reject for no results
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
    db.query(
      updatePasswordSql,
      [newPassword, collectionOfficerId],
      (err, result) => {
        if (err) {
          return reject("Database error while updating password");
        }
        resolve(); // Password updated successfully
      }
    );
  });
};

exports.getProfileById = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                firstNameEnglish, firstNameSinhala, firstNameTamil,
                lastNameEnglish, lastNameSinhala, lastNameTamil,
                phoneNumber01, phoneNumber02, image, nic, email, 
                houseNumber, streetName, city, district, province, 
                country, languages
            FROM collectionofficer
            WHERE id = ?
        `;

        db.query(sql, [userId], (err, results) => {
            if (err) {
                return reject(new Error('Database error: ' + err));
            }

            if (results.length === 0) {
                return reject(new Error('User not found'));
            }

            resolve(results[0]);
        });
    });
};


exports.getUserDetailsById = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
              co.firstNameEnglish AS firstName,
              co.lastNameEnglish AS lastName,
              co.phoneNumber01 AS phoneNumber,
              co.nic AS nicNumber,
              CONCAT(co.houseNumber, ', ', co.streetName, ', ', co.city) AS address,
              cod.empid,
              cod.companyNameEnglish AS companyName,
              cod.jobRole AS jobRole,
              cod.assignedDistrict AS regcode
            FROM collectionofficer AS co
            JOIN collectionofficercompanydetails AS cod 
              ON cod.collectionOfficerId = co.id
            WHERE co.id = ?
        `;

        db.query(sql, [userId], (err, results) => {
            if (err) {
                return reject(new Error('Database error: ' + err));
            }
            if (results.length === 0) {
                return reject(new Error('User not found'));
            }
            resolve(results[0]);
        });
    });
};


exports.updatePhoneNumberById = (userId, phoneNumber) => {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE collectionofficer SET phoneNumber01 = ? WHERE id = ?';
        db.query(query, [phoneNumber, userId], (error, results) => {
            if (error) {
                return reject(new Error('Database error: ' + error));
            }
            resolve(results);
        });
    });
};

exports.getQRCodeByOfficerId = (officerId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT QRcode 
            FROM collectionofficer
            WHERE id = ?
        `;

        db.query(query, [officerId], (error, results) => {
          if (error) {
              console.error('Error fetching officer QR code from DB:', error);
              return reject(new Error('Database query failed'));
          }
          resolve(results);
      });
    });
};