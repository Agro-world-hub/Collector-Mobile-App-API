const jwt = require("jsonwebtoken");
const db = require("../startup/database");

// Insert payment for a registered farmer
exports.insertFarmerPayment = (farmerId, userId, invoiceNumber) => {
  return new Promise((resolve, reject) => {
    const paymentQuery = `
            INSERT INTO registeredfarmerpayments (userId, collectionOfficerId, InvNo) 
            VALUES (?, ?, ?)
        `;
    const paymentValues = [farmerId, userId, invoiceNumber];

    db.collectionofficer.query(paymentQuery, paymentValues, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result.insertId); // Return the inserted farmer payment ID
    });
  });
};

// Insert crop details
// exports.insertCropDetails = (registeredFarmerId, crop) => {
//     return new Promise((resolve, reject) => {
//         const {
//             varietyId,
//             gradeAprice,
//             gradeBprice,
//             gradeCprice,
//             gradeAquan,
//             gradeBquan,
//             gradeCquan,
//             image
//         } = crop;

//         const cropQuery = `
//             INSERT INTO farmerpaymentscrops (
//                 registerFarmerId, cropId, gradeAprice, gradeBprice, gradeCprice, 
//                 gradeAquan, gradeBquan, gradeCquan, image
//             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
//         `;

//         const cropValues = [
//             registeredFarmerId,
//             varietyId,
//             gradeAprice || 0,
//             gradeBprice || 0,
//             gradeCprice || 0,
//             gradeAquan || 0,
//             gradeBquan || 0,
//             gradeCquan || 0,
//             image ? Buffer.from(image, 'base64') : null
//         ];

//         db.collectionofficer.query(cropQuery, cropValues, (err, result) => {
//             if (err) {
//                 return reject(err);
//             }
//             resolve(result);
//         });
//     });
// };

// exports.insertCropDetails = (registeredFarmerId, crop) => {
//     return new Promise((resolve, reject) => {
//       const {
//         varietyId,
//         gradeAprice,
//         gradeBprice,
//         gradeCprice,
//         gradeAquan,
//         gradeBquan,
//         gradeCquan,
//         imageUrl // Now using the S3 image URL instead of base64 data
//       } = crop;

//       const cropQuery = `
//         INSERT INTO farmerpaymentscrops (
//           registerFarmerId, cropId, gradeAprice, gradeBprice, gradeCprice, 
//           gradeAquan, gradeBquan, gradeCquan, image
//         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
//       `;

//       const cropValues = [
//         registeredFarmerId,
//         varietyId,
//         gradeAprice || 0,
//         gradeBprice || 0,
//         gradeCprice || 0,
//         gradeAquan || 0,
//         gradeBquan || 0,
//         gradeCquan || 0,
//         imageUrl // Store the URL instead of binary data
//       ];

//       db.collectionofficer.query(cropQuery, cropValues, (err, result) => {
//         if (err) {
//           return reject(err);
//         }
//         resolve(result);
//       });
//     });
//   };


// exports.insertCropDetails = (registeredFarmerId, crop, officerId, centerId) => {
//   return new Promise((resolve, reject) => {
//     const {
//       varietyId,
//       gradeAprice,
//       gradeBprice,
//       gradeCprice,
//       gradeAquan,
//       gradeBquan,
//       gradeCquan,
//       imageUrl
//     } = crop;

//     const cropQuery = `
//       INSERT INTO farmerpaymentscrops (
//         registerFarmerId, cropId, gradeAprice, gradeBprice, gradeCprice,
//         gradeAquan, gradeBquan, gradeCquan, image
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     const cropValues = [
//       registeredFarmerId,
//       varietyId,
//       gradeAprice || 0,
//       gradeBprice || 0,
//       gradeCprice || 0,
//       gradeAquan || 0,
//       gradeBquan || 0,
//       gradeCquan || 0,
//       imageUrl
//     ];

//     // Get a connection from the pool for transaction support
//     db.collectionofficer.getConnection((err, connection) => {
//       if (err) {
//         return reject(err);
//       }

//       // Begin transaction
//       connection.beginTransaction((transactionErr) => {
//         if (transactionErr) {
//           connection.release();
//           return reject(transactionErr);
//         }

//         // First insert the crop details
//         connection.query(cropQuery, cropValues, (insertErr, insertResult) => {
//           if (insertErr) {
//             return connection.rollback(() => {
//               connection.release();
//               reject(insertErr);
//             });
//           }

//           // Update the complete column for each grade in officerdailytarget
//           const updateOfficerQuery = `
//             UPDATE officerdailytarget odt
//             JOIN dailytarget dt ON odt.dailyTargetId = dt.id
//             SET odt.complete = LEAST(
//               odt.target,
//               odt.complete +
//                 CASE
//                   WHEN odt.grade = 'A' THEN ?
//                   WHEN odt.grade = 'B' THEN ?
//                   WHEN odt.grade = 'C' THEN ?
//                   ELSE 0
//                 END
//             )
//             WHERE odt.varietyId = ?  
//             AND odt.officerId = ?
//             AND CURRENT_DATE() BETWEEN dt.fromDate AND dt.toDate
//             AND odt.complete < odt.target
//           `;

//           const updateOfficerValues = [
//             gradeAquan || 0,
//             gradeBquan || 0,
//             gradeCquan || 0,
//             varietyId,
//             officerId
//           ];

//           connection.query(updateOfficerQuery, updateOfficerValues, (updateOfficerErr, updateOfficerResult) => {
//             if (updateOfficerErr) {
//               return connection.rollback(() => {
//                 connection.release();
//                 reject(updateOfficerErr);
//               });
//             }

//             // Now update the center dailytargetitems table
//             // Assuming there are completeA, completeB, completeC columns or similar
//             const updateCenterQuery = `
//               UPDATE dailytargetitems dti
//               JOIN dailytarget dt ON dti.targetId = dt.id
//               SET
//                 dti.complteQtyA = LEAST(
//                   dti.qtyA,
//                   dti.complteQtyA + ?
//                 ),
//                 dti.complteQtyB = LEAST(
//                   dti.qtyB,
//                   dti.complteQtyB + ?
//                 ),
//                 dti.complteQtyC = LEAST(
//                   dti.qtyC,
//                   dti.complteQtyC + ?
//                 )
//               WHERE dti.varietyId = ?
//               AND dt.centerId = ?
//               AND CURRENT_DATE() BETWEEN dt.fromDate AND dt.toDate
//               AND dt.id IN (
//                 SELECT DISTINCT odt.dailyTargetId 
//                 FROM officerdailytarget odt 
//                 WHERE odt.varietyId = ? 
//                 AND odt.officerId = ?
//                 AND CURRENT_DATE() BETWEEN 
//                   (SELECT fromDate FROM dailytarget WHERE id = odt.dailyTargetId) 
//                   AND 
//                   (SELECT toDate FROM dailytarget WHERE id = odt.dailyTargetId)
//               )
//             `;

//             const updateCenterValues = [
//               gradeAquan || 0,
//               gradeBquan || 0,
//               gradeCquan || 0,
//               varietyId,
//               centerId,
//               varietyId,
//               officerId
//             ];

//             connection.query(updateCenterQuery, updateCenterValues, (updateCenterErr, updateCenterResult) => {
//               if (updateCenterErr) {
//                 return connection.rollback(() => {
//                   connection.release();
//                   reject(updateCenterErr);
//                 });
//               }

//               // If everything succeeded, commit the transaction
//               connection.commit((commitErr) => {
//                 if (commitErr) {
//                   return connection.rollback(() => {
//                     connection.release();
//                     reject(commitErr);
//                   });
//                 }

//                 connection.release();
//                 resolve({
//                   cropInserted: true,
//                   officerTargetUpdated: updateOfficerResult.affectedRows > 0,
//                   centerTargetUpdated: updateCenterResult.affectedRows > 0,
//                   cropId: insertResult.insertId,
//                   officerUpdatedRows: updateOfficerResult.affectedRows,
//                   centerUpdatedRows: updateCenterResult.affectedRows
//                 });
//               });
//             });
//           });
//         });
//       });
//     });
//   });
// };

exports.insertCropDetails = (registeredFarmerId, crop, officerId, centerId) => {
  return new Promise((resolve, reject) => {
    const {
      varietyId,
      gradeAprice,
      gradeBprice,
      gradeCprice,
      gradeAquan,
      gradeBquan,
      gradeCquan,
      imageAUrl,
      imageBUrl,
      imageCUrl
    } = crop;

    const cropQuery = `
      INSERT INTO farmerpaymentscrops (
        registerFarmerId, cropId, gradeAprice, gradeBprice, gradeCprice,
        gradeAquan, gradeBquan, gradeCquan, imageA, imageB, imageC
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const cropValues = [
      registeredFarmerId,
      varietyId,
      gradeAprice || 0,
      gradeBprice || 0,
      gradeCprice || 0,
      gradeAquan || 0,
      gradeBquan || 0,
      gradeCquan || 0,
      imageAUrl,
      imageBUrl,
      imageCUrl
    ];

    // Get a connection from the pool for transaction support
    db.collectionofficer.getConnection((err, connection) => {
      if (err) {
        return reject(err);
      }

      // Begin transaction
      connection.beginTransaction((transactionErr) => {
        if (transactionErr) {
          connection.release();
          return reject(transactionErr);
        }

        // First insert the crop details
        connection.query(cropQuery, cropValues, (insertErr, insertResult) => {
          if (insertErr) {
            return connection.rollback(() => {
              connection.release();
              reject(insertErr);
            });
          }

          // Update the complete column for each grade in officerdailytarget
          const updateOfficerQuery = `
            UPDATE officerdailytarget odt
            JOIN dailytarget dt ON odt.dailyTargetId = dt.id
            SET odt.complete = LEAST(
              odt.target,
              odt.complete +
                CASE
                  WHEN odt.grade = 'A' THEN ?
                  WHEN odt.grade = 'B' THEN ?
                  WHEN odt.grade = 'C' THEN ?
                  ELSE 0
                END
            )
            WHERE odt.varietyId = ?  
            AND odt.officerId = ?
            AND CURRENT_DATE() BETWEEN dt.fromDate AND dt.toDate
            AND odt.complete < odt.target
          `;

          const updateOfficerValues = [
            gradeAquan || 0,
            gradeBquan || 0,
            gradeCquan || 0,
            varietyId,
            officerId
          ];

          connection.query(updateOfficerQuery, updateOfficerValues, (updateOfficerErr, updateOfficerResult) => {
            if (updateOfficerErr) {
              return connection.rollback(() => {
                connection.release();
                reject(updateOfficerErr);
              });
            }

            // Now update the center dailytargetitems table
            // Assuming there are completeA, completeB, completeC columns or similar
            const updateCenterQuery = `
              UPDATE dailytargetitems dti
              JOIN dailytarget dt ON dti.targetId = dt.id
              SET
                dti.complteQtyA = LEAST(
                  dti.qtyA,
                  dti.complteQtyA + ?
                ),
                dti.complteQtyB = LEAST(
                  dti.qtyB,
                  dti.complteQtyB + ?
                ),
                dti.complteQtyC = LEAST(
                  dti.qtyC,
                  dti.complteQtyC + ?
                )
              WHERE dti.varietyId = ?
              AND dt.centerId = ?
              AND CURRENT_DATE() BETWEEN dt.fromDate AND dt.toDate
              AND dt.id IN (
                SELECT DISTINCT odt.dailyTargetId 
                FROM officerdailytarget odt 
                WHERE odt.varietyId = ? 
                AND odt.officerId = ?
                AND CURRENT_DATE() BETWEEN 
                  (SELECT fromDate FROM dailytarget WHERE id = odt.dailyTargetId) 
                  AND 
                  (SELECT toDate FROM dailytarget WHERE id = odt.dailyTargetId)
              )
            `;

            const updateCenterValues = [
              gradeAquan || 0,
              gradeBquan || 0,
              gradeCquan || 0,
              varietyId,
              centerId,
              varietyId,
              officerId
            ];

            connection.query(updateCenterQuery, updateCenterValues, (updateCenterErr, updateCenterResult) => {
              if (updateCenterErr) {
                return connection.rollback(() => {
                  connection.release();
                  reject(updateCenterErr);
                });
              }

              // If everything succeeded, commit the transaction
              connection.commit((commitErr) => {
                if (commitErr) {
                  return connection.rollback(() => {
                    connection.release();
                    reject(commitErr);
                  });
                }

                connection.release();
                resolve({
                  cropInserted: true,
                  officerTargetUpdated: updateOfficerResult.affectedRows > 0,
                  centerTargetUpdated: updateCenterResult.affectedRows > 0,
                  cropId: insertResult.insertId,
                  officerUpdatedRows: updateOfficerResult.affectedRows,
                  centerUpdatedRows: updateCenterResult.affectedRows
                });
              });
            });
          });
        });
      });
    });
  });
};

exports.getCropDetailsByUserAndFarmerId = (userId, registeredFarmerId) => {
  return new Promise((resolve, reject) => {
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
                (COALESCE(fpc.gradeAprice * fpc.gradeAquan, 0) +
                 COALESCE(fpc.gradeBprice * fpc.gradeBquan, 0) +
                 COALESCE(fpc.gradeCprice * fpc.gradeCquan, 0)) AS total,
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
                  rfp.userId = ? AND fpc.registerFarmerId = ?
            ORDER BY 
                fpc.createdAt DESC
        `;

    db.collectionofficer.query(query, [userId, registeredFarmerId], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
};


// exports.getAllCropNames = () => {
//     return new Promise((resolve, reject) => {
//         const query = 'SELECT id, cropNameEnglish FROM cropgroup';

//         db.plantcare.query(query, (error, results) => {
//             if (error) {
//                 return reject(error);  // Rejecting the promise with the error
//             }
//             resolve(results);  // Resolving the promise with the results
//         });

//     });
// };



// exports.getVarietiesByCropId = (cropId) => {
//     return new Promise((resolve, reject) => {
//         const query = 'SELECT id, varietyNameEnglish FROM cropvariety WHERE cropGroupId = ?';
//         db.plantcare.query(query, [cropId], (error, results) => {
//             if (error) {
//                 return reject(error);  // Reject with error for controller to handle
//             }
//             resolve(results);  // Resolve with results
//         });

//     });
// };


// exports.getAllCropNames= (officerId) => {
//   return new Promise((resolve, reject) => {
//       if (!officerId) {
//           return reject(new Error("Officer ID is required"));
//       }

//       // This query gets unique crop groups for a specific officer
//       const cropQuery = `
//           SELECT DISTINCT
//               cg.id,
//               cg.cropNameEnglish
//           FROM 
//               officerdailytarget odt
//           INNER JOIN
//               plant_care.cropvariety cv ON odt.varietyId = cv.id
//           INNER JOIN
//               plant_care.cropgroup cg ON cv.cropGroupId = cg.id
//           WHERE
//               odt.officerId = ?
//           ORDER BY
//               cg.cropNameEnglish
//       `;

//       db.collectionofficer.query(cropQuery, [officerId], (error, results) => {
//           if (error) {
//               console.error("Error fetching officer crop details:", error);
//               return reject(error);
//           }

//           // Format exactly matches what the frontend expects
//           resolve(results);
//       });
//   });
// };


exports.getAllCropNames = (officerId) => {
  return new Promise((resolve, reject) => {
    if (!officerId) {
      return reject(new Error("Officer ID is required"));
    }

    // This query gets unique crop groups for a specific officer
    const cropQuery = `
          SELECT DISTINCT
              cg.id,
              cg.cropNameEnglish,
              cg.cropNameSinhala,
              cg.cropNameTamil
          FROM 
              officerdailytarget odt
          INNER JOIN
              plant_care.cropvariety cv ON odt.varietyId = cv.id
          INNER JOIN
              plant_care.cropgroup cg ON cv.cropGroupId = cg.id
          WHERE
              odt.officerId = ?
          ORDER BY
              cg.cropNameEnglish,
              cg.cropNameSinhala,
              cg.cropNameTamil
      `;

    db.collectionofficer.query(cropQuery, [officerId], (error, results) => {
      if (error) {
        console.error("Error fetching officer crop details:", error);
        return reject(error);
      }

      // Format exactly matches what the frontend expects
      resolve(results);
    });
  });
};

exports.getVarietiesByCropId = (officerId, cropId) => {
  return new Promise((resolve, reject) => {
    if (!officerId || !cropId) {
      return reject(new Error("Officer ID and Crop ID are required"));
    }

    // This query gets varieties for a specific officer and crop group
    const varietyQuery = `
          SELECT DISTINCT
              cv.id,
              cv.varietyNameEnglish,
              cv.varietyNameSinhala,
              cv.varietyNameTamil
          FROM 
              officerdailytarget odt
          INNER JOIN
              plant_care.cropvariety cv ON odt.varietyId = cv.id
          WHERE
              odt.officerId = ?
              AND cv.cropGroupId = ?
          ORDER BY
              cv.varietyNameEnglish,
              cv.varietyNameSinhala,
              cv.varietyNameTamil
      `;

    db.collectionofficer.query(varietyQuery, [officerId, cropId], (error, results) => {
      if (error) {
        console.error("Error fetching varieties for officer and crop:", error);
        return reject(error);
      }

      // Transform to match the frontend expected format
      const formattedResults = results.map(variety => ({
        id: variety.id,
        varietyEnglish: variety.varietyNameEnglish,
        varietySinhala: variety.varietyNameSinhala,
        varietyTamil: variety.varietyNameTamil
      }));

      resolve(formattedResults);
    });
  });
};



exports.getMarketPricesByVarietyId = (varietyId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT grade, price FROM marketprice WHERE varietyId = ?';
    db.collectionofficer.query(query, [varietyId], (error, results) => {
      if (error) {
        return reject(error);  // Reject with error to be handled in the controller
      }
      resolve(results);  // Resolve with results
    });
  });
};


exports.getLatestInvoiceNumberDao = (empId, currentDate) => {
  return new Promise((resolve, reject) => {
    const query = `
        SELECT invNo 
        FROM registeredfarmerpayments 
        WHERE invNo LIKE ? 
        ORDER BY id DESC 
        LIMIT 1
      `;

    const searchPattern = `${empId}${currentDate}%`; // Format: EMPIDYYMMDD%

    db.collectionofficer.query(query, [searchPattern], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results.length > 0 ? results[0] : null);
    });
  });
};


//Collection 
exports.createCollection = (crop, variety, loadIn, routeNumber, buildingNo, streetName, city) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO geolocation (crop, variety, loadIn, , routeNumber, buildingNo, streetName, city, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Assigned')";

    const values = [crop, variety, loadIn, , routeNumber, buildingNo, streetName, city];

    db.collectionofficer.query(sql, values, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};



exports.getAllCropNames = () => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT id, cropNameEnglish FROM cropgroup';

    db.plantcare.query(query, (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });

  });
};


exports.getVarietiesByCropIdCollection = (officerId, cropId) => {
  return new Promise((resolve, reject) => {
    if (!officerId || !cropId) {
      return reject(new Error("Officer ID and Crop ID are required"));
    }

    const varietyQuery = `
      SELECT DISTINCT
          cv.id,
          cv.varietyNameEnglish AS varietyEnglish,
          cv.varietyNameSinhala AS varietySinhala,
          cv.varietyNameTamil AS varietyTamil
      FROM 
          plant_care.cropvariety cv
      WHERE
          cv.cropGroupId = ?
      ORDER BY
          cv.varietyNameEnglish
    `;

    console.log('Executing SQL Query:', {
      query: varietyQuery,
      cropId: cropId
    });

    db.collectionofficer.query(varietyQuery, [cropId], (error, results) => {
      if (error) {
        console.error("Detailed Query Error:", {
          error: error,
          sqlMessage: error.sqlMessage,
          sqlState: error.sqlState,
          code: error.code
        });
        return reject(error);
      }

      console.log('Query Results:', {
        rowCount: results.length,
        firstResult: results[0]
      });

      resolve(results);
    });
  });
};


// exports.getAllUsers = (officerId) => {
//   return new Promise((resolve, reject) => {
//     const userQuery = ` 
//       SELECT 
//         id, 
//         firstName, 
//         phoneNumber, 
//         NICnumber, 
//         profileImage, 
//         farmerQr, 
//         membership, 
//         activeStatus, 
//         houseNo, 
//         streetName, 
//         city, 
//         district, 
//         route,
//         created_at
//       FROM plant_care.users 
//       WHERE activeStatus = 'active' 
//     `;

//     db.collectionofficer.query(userQuery, (error, results) => {
//       if (error) {
//         console.error("Error fetching users:", error);
//         return reject(error);
//       }

//       const formattedUsers = results.map(user => ({
//         id: user.id,
//         firstName: user.firstName || '',
//         phoneNumber: user.phoneNumber || '',
//         nicNumber: user.NICnumber || '',
//         profileImage: user.profileImage || null,
//         farmerQr: user.farmerQr || null,
//         membership: user.membership || '',
//         activeStatus: user.activeStatus || '',
//         address: {
//           buildingNo: user.houseNo || null,
//           streetName: user.streetName || null,
//           city: user.city || null,
//           district: user.district || null,
//         },
//         routeNumber: user.route || null,
//         createdAt: user.created_at || null
//       }));

//       resolve(formattedUsers);
//     });
//   });
// };

exports.getAllUsers = (officerId, nicNumber = null) => {
  return new Promise((resolve, reject) => {
    let userQuery = `
      SELECT 
        id, 
        firstName, 
        phoneNumber, 
        NICnumber, 
        profileImage, 
        farmerQr, 
        membership, 
        activeStatus, 
        houseNo, 
        streetName, 
        city, 
        district, 
        route,
        created_at
      FROM plant_care.users 
      WHERE activeStatus = 'active'
    `;

    // Add NIC number filter if provided
    const queryParams = [];
    if (nicNumber) {
      userQuery += ` AND NICnumber = ?`;
      queryParams.push(nicNumber);
    }

    db.collectionofficer.query(userQuery, queryParams, (error, results) => {
      if (error) {
        console.error("Error fetching users:", error);
        return reject(error);
      }

      const formattedUsers = results.map(user => ({
        id: user.id,
        firstName: user.firstName || '',
        phoneNumber: user.phoneNumber || '',
        nicNumber: user.NICnumber || '',
        profileImage: user.profileImage || null,
        farmerQr: user.farmerQr || null,
        membership: user.membership || '',
        activeStatus: user.activeStatus || '',
        address: {
          buildingNo: user.houseNo || null,
          streetName: user.streetName || null,
          city: user.city || null,
          district: user.district || null,
        },
        routeNumber: user.route || null,
        createdAt: user.created_at || null
      }));

      resolve(formattedUsers);
    });
  });
};


// DAO method to update user address in the plant_care database
// DAO method to update user address in the plant_care.users table
exports.updateUserAddress = (userId, routeNumber, buildingNo, streetName, city) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE plant_care.users
      SET
        route = ?,
        houseNo = ?,
        streetName = ?,
        city = ?
      WHERE id = ?
    `;

    db.plantcare.query(
      sql,
      [routeNumber, buildingNo, streetName, city, userId],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};


// DAO method to create collection request in the collection_officer database
// exports.createCollectionRequest = (farmerId, cmId, crop, variety, loadIn, centerId, companyId) => {
//   return new Promise((resolve, reject) => {
//     const sql = `
//       INSERT INTO collection_officer.collectionrequest
//       (farmerId, cmId , cropId, varietyId, loadWeight, centerId, companyId, createdAt)
//       VALUES (?, ?, ? ,?, ?, ?, ?, NOW())
//     `;

//     db.plantcare.query(
//       sql,
//       [farmerId, cmId, crop, variety, loadIn, centerId, companyId],
//       (err, result) => {
//         if (err) return reject(err);
//         resolve(result);
//       }
//     );
//   });
// };

// exports.createCollectionRequest = (farmerId, cmId, crop, variety, loadIn, centerId, companyId) => {
//   return new Promise((resolve, reject) => {
//     const sql = `
//       INSERT INTO collection_officer.collectionrequest
//       (farmerId, cmId, cropId, varietyId, loadWeight, centerId, companyId, createdAt, requestStatus)
//       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)
//     `;

//     db.plantcare.query(
//       sql,
//       [farmerId, cmId, crop, variety, loadIn, centerId, companyId, "Not Assigned"],
//       (err, result) => {
//         if (err) return reject(err);
//         resolve(result);
//       }
//     );
//   });
// };
// exports.createCollectionRequest = (farmerId, cmId, crop, variety, loadIn, centerId, companyId, scheduleDate) => {
//   return new Promise((resolve, reject) => {
//     const sql = `
//       INSERT INTO collection_officer.collectionrequest
//       (farmerId, cmId, centerId, companyId, requestStatus, scheduleDate, createdAt)
//       VALUES (?, ?, ?, ?, ?, ?, NOW())
//     `;

//     db.plantcare.query(
//       sql,
//       [farmerId, cmId, centerId, companyId, "Not Assigned", scheduleDate],
//       (err, result) => {
//         if (err) return reject(err);
//         resolve(result);
//       }
//     );
//   });
// };

// // DAO method to insert into collectionrequestitems
// exports.createCollectionRequestItems = (requestId, cropId, varietyId, loadWeight) => {
//   return new Promise((resolve, reject) => {
//     const sql = `
//       INSERT INTO collection_officer.collectionrequestitems
//       (requestId, cropId, varietyId, loadWeight)
//       VALUES (?, ?, ?, ?)
//     `;

//     db.plantcare.query(
//       sql,
//       [requestId, cropId, varietyId, loadWeight],
//       (err, result) => {
//         if (err) return reject(err);
//         resolve(result);
//       }
//     );
//   });
// };


exports.createCollectionRequest = (farmerId, cmId, crop, variety, loadIn, centerId, companyId, scheduleDate) => {
  return new Promise((resolve, reject) => {
    const checkSql = `
      SELECT id FROM collection_officer.collectionrequest
      WHERE farmerId = ? AND cmId = ? AND centerId = ? AND companyId = ? AND scheduleDate = ?
    `;

    db.plantcare.query(checkSql, [farmerId, cmId, centerId, companyId, scheduleDate], (err, results) => {
      if (err) return reject(err);

      if (results.length > 0) {
        // Request already exists, return its ID
        resolve({ insertId: results[0].id });
      } else {
        // Insert new collection request
        const insertSql = `
          INSERT INTO collection_officer.collectionrequest
          (farmerId, cmId, centerId, companyId, requestStatus, scheduleDate, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;

        db.plantcare.query(insertSql, [farmerId, cmId, centerId, companyId, "Not Assigned", scheduleDate], (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      }
    });
  });
};

exports.createCollectionRequestItems = (requestId, cropId, varietyId, loadWeight) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO collection_officer.collectionrequestitems
      (requestId, cropId, varietyId, loadWeight)
      VALUES (?, ?, ?, ?)
    `;

    db.plantcare.query(sql, [requestId, cropId, varietyId, loadWeight], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};
