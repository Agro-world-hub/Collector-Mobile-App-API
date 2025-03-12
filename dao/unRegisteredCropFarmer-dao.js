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
      imageUrl
    } = crop;

    const cropQuery = `
      INSERT INTO farmerpaymentscrops (
        registerFarmerId, cropId, gradeAprice, gradeBprice, gradeCprice,
        gradeAquan, gradeBquan, gradeCquan, image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      imageUrl
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
          console.log("Grade A Quantity: ", gradeAquan);
console.log("Grade B Quantity: ", gradeBquan);
console.log("Grade C Quantity: ", gradeCquan);

          
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

exports.getAllCropNames = () => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT id, cropNameEnglish, cropNameSinhala, cropNameTamil FROM cropgroup';

    db.plantcare.query(query, (error, results) => {
      if (error) {
        return reject(error);  // Rejecting the promise with the error
      }
      resolve(results);  // Resolving the promise with the results
    });

  });
};




exports.getVarietiesByCropId = (cropId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT id, varietyNameEnglish, varietyNameSinhala, varietyNameTamil FROM cropvariety WHERE cropGroupId = ?';
    db.plantcare.query(query, [cropId], (error, results) => {
      if (error) {
        return reject(error);  // Reject with error for controller to handle
      }
      resolve(results);  // Resolve with results
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