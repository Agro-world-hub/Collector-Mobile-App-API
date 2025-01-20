const db = require('../startup/database'); 
const QRCode = require('qrcode');

exports.getDailyReport = (collectionOfficerId, fromDate, toDate) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        DATE(rfp.createdAt) AS date,
        COUNT(DISTINCT rfp.id) AS totalPayments,
        SUM(IFNULL(fpc.gradeAquan, 0) + IFNULL(fpc.gradeBquan, 0) + IFNULL(fpc.gradeCquan, 0)) AS totalWeight
      FROM 
        registeredfarmerpayments rfp
      LEFT JOIN 
        farmerpaymentscrops fpc ON rfp.id = fpc.registerFarmerId
      WHERE 
        rfp.collectionOfficerId = ? 
        AND rfp.createdAt BETWEEN ? AND ?
      GROUP BY 
        DATE(rfp.createdAt)
      ORDER BY 
        date ASC;
    `;
    

    const params = [collectionOfficerId, fromDate, toDate];

    db.query(query, params, (err, results) => {
      if (err) {
        return reject(err);
      }
      
      const reportData = results.map(row => ({
        date: row.date,
        totalPayments: row.totalPayments,
        totalWeight: row.totalWeight ? parseFloat(row.totalWeight) : 0,
      }));

      resolve(reportData);
    });
  });
};


exports.checkNICExist = (nic) => {
  return new Promise((resolve, reject) => {
    console.log("NIC:", nic);
      const sql = `
          SELECT COUNT(*) AS count 
          FROM collectionofficer 
          WHERE nic = ?
      `;

      db.collectionofficer.query(sql, [nic], (err, results) => {
          if (err) {
              return reject(err);
              
          }
          resolve(results[0].count > 0); // Return true if either NIC or email exists
      });
  });
};
exports.checkEmailExist = (email) => {
  return new Promise((resolve, reject) => {
      const sql = `
          SELECT COUNT(*) AS count 
          FROM collectionofficer 
          WHERE email = ?
      `;

      db.collectionofficer.query(sql, [email], (err, results) => {
          if (err) {
              return reject(err);
          }
          resolve(results[0].count > 0); // Return true if either NIC or email exists
      });
  });
};

exports.createCollectionOfficerPersonal = (officerData, centerId, companyId, irmId) => {
  return new Promise((resolve, reject) => {
    try {
      console.log("Center ID:", centerId, "Company ID:", companyId, "IRM ID:", irmId);

      // SQL query for inserting the officer data
      const sql = `
        INSERT INTO collectionofficer (
          centerId, companyId, irmId, firstNameEnglish, firstNameSinhala, firstNameTamil, lastNameEnglish,
          lastNameSinhala, lastNameTamil, jobRole, empId, empType, phoneCode01, phoneNumber01, phoneCode02, phoneNumber02,
          nic, email, houseNumber, streetName, city, district, province, country,
          languages, accHolderName, accNumber, bankName, branchName, status,passwordUpdated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                 ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                 ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Not Approved',0)
      `;

      // Execute the query
      db.collectionofficer.query(
        sql,
        [
          centerId,
          companyId,
          irmId,
          officerData.firstNameEnglish,
          officerData.firstNameSinhala || null,
          officerData.firstNameTamil || null,
          officerData.lastNameEnglish,
          officerData.lastNameSinhala || null,
          officerData.lastNameTamil || null,
          officerData.jobRole,
          officerData.empId, // Map userId from request body
          officerData.empType,
          officerData.phoneCode01,
          officerData.phoneNumber01,
          officerData.phoneCode02 || null,
          officerData.phoneNumber02 || null,
          officerData.nic,
          officerData.email,
          officerData.houseNumber,
          officerData.streetName,
          officerData.city,
          officerData.district,
          officerData.province,
          officerData.country,
          officerData.languages,
          officerData.accHolderName || null,
          officerData.accNumber || null,
          officerData.bankName || null,
          officerData.branchName || null,
        ],
        (err, results) => {
          if (err) {
            console.error("Database query error:", err);
            return reject(new Error("Failed to insert collection officer into the database."));
          }
          resolve(results); // Return the query results on success
        }
      );
    } catch (error) {
      console.error("Unexpected error in createCollectionOfficerPersonal:", error);
      reject(error); // Handle unexpected errors
    }
  });
};


exports.getIrmDetails = async (irmId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT companyId, centerId 
      FROM collectionofficer
            WHERE id = ?;
    `;
    db.collectionofficer.query(sql, [irmId], (err, results) => {
      if (err) {
        console.error("Error fetching IRM details:", err);
        return reject(err);
      }
      resolve(results[0]); // Return the first result (expected to be unique)
    });
  });
};


exports.getForCreateId = (role) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT empId FROM collectionofficer WHERE empId LIKE ? ORDER BY empId DESC LIMIT 1";
    db.collectionofficer.query(sql, [`${role}%`], (err, results) => {
      if (err) {
        return reject(err);
      }

      if (results.length > 0) {
        const numericPart = parseInt(results[0].empId.substring(3), 10);

        const incrementedValue = numericPart + 1;

        results[0].empId = incrementedValue.toString().padStart(5, "0");
      }

      resolve(results);
    });
  });
};


//transaction list 
exports.getFarmerListByCollectionOfficerAndDate = (collectionOfficerId, date) => {
  return new Promise((resolve, reject) => {
      const query = `
          SELECT 
              RFP.id AS registeredFarmerId, 
              U.id AS userId, 
              U.firstName, 
              U.lastName, 
              U.NICnumber, 
              SUM(FPC.gradeAprice * FPC.gradeAquan) +
              SUM(FPC.gradeBprice * FPC.gradeBquan) +
              SUM(FPC.gradeCprice * FPC.gradeCquan) AS totalAmount
          FROM farmerpaymentscrops FPC
          INNER JOIN registeredfarmerpayments RFP ON FPC.registerFarmerId = RFP.id
          INNER JOIN plant_care.users U ON RFP.userId = U.id
          WHERE RFP.collectionOfficerId = ?
            AND DATE(RFP.createdAt) = ?
          GROUP BY RFP.id, U.id, U.firstName, U.lastName, U.NICnumber
      `;
      db.collectionofficer.query(query, [collectionOfficerId, date], (error, results) => {
          if (error) {
              return reject(error); // Reject with error to be handled in the controller
          }
          resolve(results); // Resolve with results
      });
  });
};