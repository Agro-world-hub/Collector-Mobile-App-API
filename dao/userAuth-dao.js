const db = require("../startup/database");

// DAO for fetching officer details by empId
exports.getOfficerByEmpId = (empId) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT id, jobRole FROM collectionofficer WHERE empId = ?";
    db.collectionofficer.query(sql, [empId], (err, results) => {
      if (err) {
        return reject(new Error("Database error"));
      }
      if (results.length === 0) {
        return reject(new Error("Invalid Employee ID"));
      }
      resolve(results);
      console.log("Results:", results);
    });
  });
};

// DAO for fetching officer details by ID
exports.getOfficerPasswordById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM collectionofficer WHERE id = ?";
    db.collectionofficer.query(sql, [id], (err, results) => {
      if (err) {
        return reject(new Error("Database error"));
      }
      if (results.length === 0) {
        return reject(new Error("Invalid email or password"));
      }
      resolve(results);
    });
  });
};


exports.updatePasswordInDatabase = (collectionOfficerId, hashedPassword) => {
  return new Promise((resolve, reject) => {
    const updatePasswordSql = `
            UPDATE collectionofficer
            SET password = ? , passwordUpdated = 1
            WHERE id = ?
        `;
    db.collectionofficer.query(
      updatePasswordSql,
      [hashedPassword, collectionOfficerId],
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

        db.collectionofficer.query(sql, [userId], (err, results) => {
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

        db.collectionofficer.query(sql, [userId], (err, results) => {
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


exports.updatePhoneNumberById = (userId, phoneNumber, phoneNumber02) => {
  console.log("DAO: updatePhoneNumberById", phoneNumber02);
  return new Promise((resolve, reject) => {
      const query = 'UPDATE collectionofficer SET phoneNumber01 = ?, phoneNumber02 =? WHERE id = ?';
      db.collectionofficer.query(query, [phoneNumber, phoneNumber02, userId], (error, results) => {
          if (error) {
              return reject(new Error('Database error: ' + error));
          }
          resolve(results);
          console.log("DAO: updatePhoneNumberById", results);
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

        db.collectionofficer.query(query, [officerId], (error, results) => {
          if (error) {
              console.error('Error fetching officer QR code from DB:', error);
              return reject(new Error('Database query failed'));
          }
          resolve(results);
      });
    });
};


// ------------created below codes after the collection officer update ------------- 

exports.getOfficerDetailsById = (officerId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        co.*, 
        cc.centerName AS collectionCenterName,
        cc.contact01 AS centerContact01,
        cc.contact02 AS centerContact02,
        cc.buildingNumber AS centerBuildingNumber,
        cc.street AS centerStreet,
        cc.district AS centerDistrict,
        cc.province AS centerProvince,
        com.companyNameEnglish AS companyName,
        com.email AS companyEmail,
        com.oicName AS companyOICName,
        com.oicEmail AS companyOICEmail
      FROM 
        collectionofficer co
      JOIN 
        collectioncenter cc ON co.centerId = cc.id
      JOIN 
        company com ON co.companyId = com.id
      WHERE 
        co.id = ?;
    `;

    db.collectionofficer.query(sql, [officerId], (err, results) => {
      if (err) {
        console.error("Database error:", err.message);
        return reject(new Error("Database error"));
      }

      if (results.length === 0) {
        return reject(new Error("Officer not found"));
      }

      resolve(results[0]); // Return the first result as the officer details
    });
  });
};
