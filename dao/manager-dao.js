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

// exports.createCollectionOfficerPersonal = (officerData, centerId, companyId, irmId) => {
//   return new Promise((resolve, reject) => {
//     try {
//       console.log("Center ID:", centerId, "Company ID:", companyId, "IRM ID:", irmId);

//       // SQL query for inserting the officer data
//       const sql = `
//         INSERT INTO collectionofficer (
//           centerId, companyId, irmId, firstNameEnglish, firstNameSinhala, firstNameTamil, lastNameEnglish,
//           lastNameSinhala, lastNameTamil, jobRole, empId, empType, phoneCode01, phoneNumber01, phoneCode02, phoneNumber02,
//           nic, email, houseNumber, streetName, city, district, province, country,
//           languages, accHolderName, accNumber, bankName, branchName, status,passwordUpdated
//         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
//                  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
//                  ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Not Approved',0)
//       `;

//       // Execute the query
//       db.collectionofficer.query(
//         sql,
//         [
//           centerId,
//           companyId,
//           irmId,
//           officerData.firstNameEnglish,
//           officerData.firstNameSinhala || null,
//           officerData.firstNameTamil || null,
//           officerData.lastNameEnglish,
//           officerData.lastNameSinhala || null,
//           officerData.lastNameTamil || null,
//           officerData.jobRole,
//           officerData.empId, // Map userId from request body
//           officerData.empType,
//           officerData.phoneCode01,
//           officerData.phoneNumber01,
//           officerData.phoneCode02 || null,
//           officerData.phoneNumber02 || null,
//           officerData.nic,
//           officerData.email,
//           officerData.houseNumber,
//           officerData.streetName,
//           officerData.city,
//           officerData.district,
//           officerData.province,
//           officerData.country,
//           officerData.languages,
//           officerData.accHolderName || null,
//           officerData.accNumber || null,
//           officerData.bankName || null,
//           officerData.branchName || null,
//         ],
//         (err, results) => {
//           if (err) {
//             console.error("Database query error:", err);
//             return reject(new Error("Failed to insert collection officer into the database."));
//           }
//           resolve(results); // Return the query results on success
//         }
//       );
//     } catch (error) {
//       console.error("Unexpected error in createCollectionOfficerPersonal:", error);
//       reject(error); // Handle unexpected errors
//     }
//   });
// };

// exports.createCollectionOfficerPersonal = (officerData, centerId, companyId, irmId) => {
//   return new Promise((resolve, reject) => {
//     try {
//       console.log("Center ID:", centerId, "Company ID:", companyId, "IRM ID:", irmId);

//       const {
//         firstNameEnglish,
//         firstNameSinhala,
//         firstNameTamil,
//         lastNameEnglish,
//         lastNameSinhala,
//         lastNameTamil,
//         jobRole,
//         empId,
//         empType,
//         phoneCode01,
//         phoneNumber01,
//         phoneCode02,
//         phoneNumber02,
//         nic,
//         email,
//         houseNumber,
//         streetName,
//         city,
//         district,
//         province,
//         country,
//         languages,
//         accHolderName,
//         accNumber,
//         bankName,
//         branchName,
//         profileImageUrl, // Base64 image URL
//       } = officerData;

//       // Ensure that the profileImageUrl is set to null if not provided
//       const image = profileImageUrl || null;

//       const insertValues = [
//         centerId,
//         companyId,
//         irmId,
//         firstNameEnglish,
//         firstNameSinhala || null,
//         firstNameTamil || null,
//         lastNameEnglish,
//         lastNameSinhala || null,
//         lastNameTamil || null,
//         jobRole,
//         empId,
//         empType,
//         phoneCode01,
//         phoneNumber01,
//         phoneCode02 || null,
//         phoneNumber02 || null,
//         nic,
//         email,
//         houseNumber || null,
//         streetName || null,
//         city || null,
//         district || null,
//         province || null,
//         country || null,
//         languages || null,
//         accHolderName || null,
//         accNumber || null,
//         bankName || null,
//         branchName || null,
//         image, // Base64 image or null
//         'Not Approved' // Status
//     ];

//       // SQL query to insert the officer data
//       const sql = `
//      INSERT INTO collectionofficer (
//         centerId, companyId, irmId, firstNameEnglish, firstNameSinhala, firstNameTamil, lastNameEnglish,
//         lastNameSinhala, lastNameTamil, jobRole, empId, empType, phoneCode01, phoneNumber01, phoneCode02, phoneNumber02,
//         nic, email, houseNumber, streetName, city, district, province, country,
//         languages, accHolderName, accNumber, bankName, branchName, image, status
//     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)


//       `;

//       // Execute the query
//       db.collectionofficer.query(sql, insertValues, (err, results) => {
//         if (err) {
//           console.error("Database query error:", err);
//           return reject(new Error("Failed to insert collection officer into the database."));
//         }
//         resolve(results); // Return the query results on success
//       });
//     } catch (error) {
//       console.error("Unexpected error in createCollectionOfficerPersonal:", error);
//       reject(error); // Handle unexpected errors
//     }
//   });
// };


// exports.createCollectionOfficerPersonal = (officerData, centerId, companyId, irmId) => {
//   return new Promise((resolve, reject) => {
//     try {
//       console.log("Center ID:", centerId, "Company ID:", companyId, "IRM ID:", irmId);

//       // SQL query for inserting the officer data
//       const sql = `
//         INSERT INTO collectionofficer (
//           centerId, companyId, irmId, firstNameEnglish, firstNameSinhala, firstNameTamil, lastNameEnglish,
//           lastNameSinhala, lastNameTamil, jobRole, empId, empType, phoneCode01, phoneNumber01, phoneCode02, phoneNumber02,
//           nic, email, houseNumber, streetName, city, district, province, country,
//           languages, accHolderName, accNumber, bankName, branchName,image, status,passwordUpdated
//         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
//                  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
//                  ?, ?, ?, ?, ?, ?, ?, ?, ?,?, 'Not Approved',0)
//       `;



//       // Execute the query
//       db.collectionofficer.query(
//         sql,
//         [
//           centerId,
//           companyId,
//           irmId,
//           officerData.firstNameEnglish,
//           officerData.firstNameSinhala || null,
//           officerData.firstNameTamil || null,
//           officerData.lastNameEnglish,
//           officerData.lastNameSinhala || null,
//           officerData.lastNameTamil || null,
//           officerData.jobRole,
//           officerData.empId, // Map userId from request body
//           officerData.empType,
//           officerData.phoneCode01,
//           officerData.phoneNumber01,
//           officerData.phoneCode02 || null,
//           officerData.phoneNumber02 || null,
//           officerData.nic,
//           officerData.email,
//           officerData.houseNumber,
//           officerData.streetName,
//           officerData.city,
//           officerData.district,
//           officerData.province,
//           officerData.country,
//           officerData.languages,
//           officerData.accHolderName || null,
//           officerData.accNumber || null,
//           officerData.bankName || null,
//           officerData.branchName || null,
//           officerData.image || null,
//         ],
//         (err, results) => {
//           if (err) {
//             console.error("Database query error:", err);
//             return reject(new Error("Failed to insert collection officer into the database."));
//           }
//           resolve(results); // Return the query results on success
//         }
//       );
//     } catch (error) {
//       console.error("Unexpected error in createCollectionOfficerPersonal:", error);
//       reject(error); // Handle unexpected errors
//     }
//   });
// };


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
          languages, accHolderName, accNumber, bankName, branchName, image, status, passwordUpdated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                 ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                 ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Not Approved', 0)
      `;

      // Use profileImageUrl instead of officerData.image
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
          officerData.profileImageUrl || null, // Use profileImageUrl here
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
  console.log("DAO: getForCreateId", role);
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
  console.log('DAO: getFarmerListByCollectionOfficerAndDate', collectionOfficerId, date);
  return new Promise((resolve, reject) => {
    const query = `
          SELECT 
              RFP.id AS registeredFarmerId, 
              U.id AS userId, 
              U.firstName, 
              U.lastName, 
              U.phoneNumber, 
              U.profileImage,
              CONCAT_WS(', ', U.houseNo, U.streetName, U.city, U.district) AS address,
              U.NICnumber, 
              SUM(FPC.gradeAprice * FPC.gradeAquan) +
              SUM(FPC.gradeBprice * FPC.gradeBquan) +
              SUM(FPC.gradeCprice * FPC.gradeCquan) AS totalAmount,
              UB.accNumber AS accountNumber,
              UB.accHolderName AS accountHolderName,
              UB.bankName AS bankName,
              UB.branchName AS branchName,
              CO.empId  
          FROM farmerpaymentscrops FPC
          INNER JOIN registeredfarmerpayments RFP ON FPC.registerFarmerId = RFP.id
          INNER JOIN plant_care.users U ON RFP.userId = U.id
          LEFT JOIN \`plant_care\`.userbankdetails UB ON U.id = UB.userId
          INNER JOIN collectionofficer CO ON RFP.collectionOfficerId = CO.id  
          WHERE RFP.collectionOfficerId = ? 
            AND DATE(RFP.createdAt) = ?
          GROUP BY 
              RFP.id, U.id, U.firstName, U.lastName, U.phoneNumber, 
              CONCAT_WS(', ', U.houseNo, U.streetName, U.city, U.district), 
              U.NICnumber, 
              UB.accNumber, UB.accHolderName, UB.bankName, UB.branchName, 
              CO.empId  -- Group by empId to include it in the result
      `;

    db.collectionofficer.query(query, [collectionOfficerId, date], (error, results) => {
      if (error) {
        return reject(error); // Reject with error to be handled in the controller
      }
      console.log('Result of transaction list:', results);
      resolve(results); // Resolve with results
    });
  });
};


// exports.getFarmerListByCollectionOfficerAndDateForManager = (userId, date) => {
//   return new Promise((resolve, reject) => {
//       const query = `
//           SELECT 
//               RFP.id AS registeredFarmerId, 
//               U.id AS userId, 
//               U.firstName, 
//               U.lastName, 
//               U.phoneNumber, 
//               CONCAT_WS(', ', U.houseNo, U.streetName, U.city, U.district) AS address,
//               U.NICnumber, 
//               SUM(FPC.gradeAprice * FPC.gradeAquan) +
//               SUM(FPC.gradeBprice * FPC.gradeBquan) +
//               SUM(FPC.gradeCprice * FPC.gradeCquan) AS totalAmount,
//               UB.address AS bankAddress,
//               UB.accNumber AS accountNumber,
//               UB.accHolderName AS accountHolderName,
//               UB.bankName AS bankName,
//               UB.branchName AS branchName,
//               CO.empId  
//           FROM farmerpaymentscrops FPC
//           INNER JOIN registeredfarmerpayments RFP ON FPC.registerFarmerId = RFP.id
//           INNER JOIN plant_care.users U ON RFP.userId = U.id
//           LEFT JOIN \`plant_care\`.userbankdetails UB ON U.id = UB.userId
//           INNER JOIN collectionofficer CO ON RFP.collectionOfficerId = CO.id  
//           WHERE RFP.collectionOfficerId = ? 
//             AND DATE(RFP.createdAt) = ?
//           GROUP BY 
//               RFP.id, U.id, U.firstName, U.lastName, U.phoneNumber, 
//               CONCAT_WS(', ', U.houseNo, U.streetName, U.city, U.district), 
//               U.NICnumber, 
//               UB.address, UB.accNumber, UB.accHolderName, UB.bankName, UB.branchName, 
//               CO.empId  -- Group by empId to include it in the result
//       `;

//       db.collectionofficer.query(query, [userId, date], (error, results) => {
//           if (error) {
//               return reject(error); // Reject with error to be handled in the controller
//           }
//           resolve(results); // Resolve with results
//       });
//   });
// };



exports.getClaimOfficer = (empID, jobRole) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        c.*, 
        comp.companyNameEnglish,
        comp.companyNameSinhala,
        comp.companyNameTamil
      FROM 
        collectionofficer c 
      INNER JOIN 
        company comp 
      ON 
        c.companyId = comp.id 
      WHERE 
        c.empId = ? 
        AND c.jobRole = ? 
        AND c.centerId IS NULL 
        AND c.irmId IS NULL
    `;

    db.collectionofficer.query(sql, [empID, jobRole], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

exports.createClaimOfficer = (officerId, irmId, centerId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE collectionofficer 
      SET 
        irmId = ?,
        centerId = ?
      WHERE 
        id = ?
    `;

    db.collectionofficer.query(sql, [irmId, centerId, officerId], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
}

exports.disclaimOfficer = (collectionOfficerId) => {
  console.log("DAO: disclaimOfficer", collectionOfficerId);
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE collectionofficer 
      SET 
        irmId = NULL,
        centerId = NULL
      WHERE 
        id = ?
    `;

    db.collectionofficer.query(sql, [collectionOfficerId], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
}




// GET farmer details for the managers report
// exports.GetFarmerReportDetailsDao = (userId, createdAtDate, farmerId) => {
//   return new Promise((resolve, reject) => {
//     const query = `
//           SELECT 
//               fpc.id AS id, 
//               cg.cropNameEnglish AS cropName,
//               cv.varietyNameEnglish AS variety,
//               fpc.gradeAprice AS unitPriceA,
//               fpc.gradeAquan AS weightA,
//               fpc.gradeBprice AS unitPriceB,
//               fpc.gradeBquan AS weightB,
//               fpc.gradeCprice AS unitPriceC,
//               fpc.gradeCquan AS weightC,
//               (COALESCE(fpc.gradeAprice * fpc.gradeAquan, 0) +
//                COALESCE(fpc.gradeBprice * fpc.gradeBquan, 0) +
//                COALESCE(fpc.gradeCprice * fpc.gradeCquan, 0)) AS total,
//                rfp.InvNo AS invoiceNumber
//           FROM 
//               farmerpaymentscrops fpc
//           INNER JOIN 
//               \`plant_care\`.\`cropvariety\` cv ON fpc.cropId = cv.id
//           INNER JOIN 
//               \`plant_care\`.\`cropgroup\` cg ON cv.cropGroupId = cg.id
//           INNER JOIN 
//               registeredfarmerpayments rfp ON fpc.registerFarmerId = rfp.id
//           WHERE 
//               rfp.userId = ? 
//               AND DATE(fpc.createdAt) = ? 
//               AND fpc.registerFarmerId = ?
//           ORDER BY 
//               fpc.createdAt DESC
//       `;

//     db.collectionofficer.query(query, [userId, createdAtDate, farmerId], (error, results) => {
//       if (error) {
//         return reject(error);
//       }
//       resolve(results);
//     });
//   });
// };


exports.GetFarmerReportDetailsDao = async (userId, createdAtDate, registeredFarmerId) => {
  const query = `
    SELECT
      fpc.id AS id,
      cg.cropNameEnglish AS cropName,
      cv.varietyNameEnglish AS variety,
      fpc.gradeAprice AS unitPriceA,
      fpc.gradeAquan AS weightA,
      fpc.gradeBprice AS unitPriceB,
      fpc.gradeBquan AS weightB,
      fpc.gradeCprice AS unitPriceC,
      fpc.gradeCquan AS weightC,
      rfp.InvNo AS invoiceNumber
    FROM
      farmerpaymentscrops fpc
    INNER JOIN
      plant_care.cropvariety cv ON fpc.cropId = cv.id
    INNER JOIN
      plant_care.cropgroup cg ON cv.cropGroupId = cg.id
    INNER JOIN
      registeredfarmerpayments rfp ON fpc.registerFarmerId = rfp.id
    WHERE
      rfp.userId = ? 
      AND fpc.registerFarmerId = ?
      AND DATE(fpc.createdAt) = ?
    ORDER BY
      fpc.createdAt DESC
  `;
  return new Promise((resolve, reject) => {
   
    console.log('@@@@@@@@ UserId:', userId);
    console.log('@@@@@@@@@   registeredFarmerId:', registeredFarmerId);
    console.log('@@@@@@@@@   createdAtDate:', createdAtDate);
   
    db.collectionofficer.query(query, [userId, registeredFarmerId, createdAtDate], (error, results) => {
      if (error) return reject(error);
      const transformedResults = results.flatMap(row => {
        const entries = [];
       
        if (row.weightA > 0) entries.push({
          id: row.id,
          cropName: row.cropName,
          variety: row.variety,
          grade: 'A',
          unitPrice: row.unitPriceA,
          quantity: row.weightA,
          subTotal: (row.unitPriceA * row.weightA).toFixed(2),
          invoiceNumber: row.invoiceNumber
        });
        if (row.weightB > 0) entries.push({
          id: row.id,
          cropName: row.cropName,
          variety: row.variety,
          grade: 'B',
          unitPrice: row.unitPriceB,
          quantity: row.weightB,
          subTotal: (row.unitPriceB * row.weightB).toFixed(2),
          invoiceNumber: row.invoiceNumber
        });
        if (row.weightC > 0) entries.push({
          id: row.id,
          cropName: row.cropName,
          variety: row.variety,
          grade: 'C',
          unitPrice: row.unitPriceC,
          quantity: row.weightC,
          subTotal: (row.unitPriceC * row.weightC).toFixed(2),
          invoiceNumber: row.invoiceNumber
        });
        return entries;
      });
      console.log('Transformed Results:', transformedResults);
      resolve(transformedResults);
    });
  });
};

// exports.GetFarmerReportDetailsDao = (userId, createdAtDate, farmerId) => {
//   return new Promise((resolve, reject) => {
//       const query = `
//           SELECT 
//               fpc.id AS id, 
//               cg.cropNameEnglish AS cropName,
//               cv.varietyNameEnglish AS variety,
//               fpc.gradeAprice AS unitPriceA,
//               fpc.gradeAquan AS weightA,
//               fpc.gradeBprice AS unitPriceB,
//               fpc.gradeBquan AS weightB,
//               fpc.gradeCprice AS unitPriceC,
//               fpc.gradeCquan AS weightC,
//               (COALESCE(fpc.gradeAprice * fpc.gradeAquan, 0) +
//                COALESCE(fpc.gradeBprice * fpc.gradeBquan, 0) +
//                COALESCE(fpc.gradeCprice * fpc.gradeCquan, 0)) AS total,
//               co.empId AS empId
//           FROM 
//               farmerpaymentscrops fpc
//           INNER JOIN 
//               \`plant_care\`.cropvariety cv ON fpc.cropId = cv.id
//           INNER JOIN 
//               \`plant_care\`.cropgroup cg ON cv.cropGroupId = cg.id
//           INNER JOIN 
//               registeredfarmerpayments rfp ON fpc.registerFarmerId = rfp.id
//           INNER JOIN 
//               collectionofficer co ON rfp.userId = co.id
//           WHERE 
//               rfp.userId = ? 
//               AND DATE(fpc.createdAt) = ? 
//               AND fpc.registerFarmerId = ?
//           ORDER BY 
//               fpc.createdAt DESC
//       `;

//       db.collectionofficer.query(query, [userId, createdAtDate, farmerId], (error, results) => {
//           if (error) {
//               return reject(error);
//           }
//           resolve(results);
//       });
//   });
// };

//get the collection officer list for the manager and the daos for the monthly report of a collection officer
exports.getCollectionOfficers = async (managerId) => {
  const sql = `
    SELECT 
      empId, 
      CONCAT(firstNameEnglish, ' ', lastNameEnglish) AS fullNameEnglish,
      CONCAT(firstNameSinhala, ' ', lastNameSinhala) AS fullNameSinhala,
      CONCAT(firstNameTamil, ' ', lastNameTamil) AS fullNameTamil,
      phoneNumber01 AS phoneNumber1,
      phoneNumber02 AS phoneNumber2,
      id AS collectionOfficerId,
      jobRole,
      status,
      image
    FROM collectionofficer
    WHERE jobRole IN ('Collection Officer', 'Driver') AND irmId = ?
  `;
  return db.collectionofficer.promise().query(sql, [managerId]);
};



exports.getOfficerDetails = async (empId) => {
  const sql = `
    SELECT 
      firstNameEnglish AS firstName, 
      lastNameEnglish AS lastName, 
      jobRole 
    FROM 
      collectionofficer
    WHERE 
      empId = ?;
  `;
  return db.collectionofficer.promise().query(sql, [empId]);
};



exports.getFarmerPaymentsSummary = async ({ collectionOfficerId, fromDate, toDate }) => {
  const sql = `
    SELECT 
      DATE(CONVERT_TZ(fpc.createdAt, '+00:00', '+05:30')) AS date, 
      SUM(gradeAquan) + SUM(gradeBquan) + SUM(gradeCquan) AS total, 
      COUNT(fpc.registerFarmerId) AS TCount
    FROM 
      registeredfarmerpayments rfp
    JOIN 
      farmerpaymentscrops fpc ON rfp.id = fpc.registerFarmerId
    WHERE 
      rfp.collectionOfficerId = ? 
      AND DATE(CONVERT_TZ(fpc.createdAt, '+00:00', '+05:30')) BETWEEN ? AND ?
    GROUP BY 
      DATE(CONVERT_TZ(fpc.createdAt, '+00:00', '+05:30'));
  `;
  return db.collectionofficer.promise().query(sql, [collectionOfficerId, fromDate, toDate]);
};

exports.getOfficerOnlineStatus = async (collectionOfficerId) => {
  return new Promise((resolve, reject) => {  // Wrap the query in a Promise
    const sql = `
      SELECT 
        OnlineStatus
      FROM 
        collectionofficer
      WHERE 
        id = ?;
    `;

    db.collectionofficer.query(sql, [collectionOfficerId], (err, results) => {
      if (err) {
        reject(new Error('Database query failed'));  // Reject the promise in case of error
        return;
      }

      if (results.length > 0) {
        resolve(results[0]);  // Resolve the promise if data is found
      } else {
        resolve(null);  // Resolve with null if no data is found
      }
    });
  });
};
