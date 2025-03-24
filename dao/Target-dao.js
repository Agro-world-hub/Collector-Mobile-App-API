// const { plantcare, collectionofficer, marketPlace, dash } = require('../startup/database');


// exports.getAllCropNameDAO = () => {
//     return new Promise((resolve, reject) => {
//         const sql = `
//             SELECT cg.id AS cropId, cv.id AS varietyId, cg.cropNameEnglish, cv.varietyNameEnglish AS varietyEnglish 
//             FROM cropvariety cv, cropgroup cg
//             WHERE cg.id = cv.cropGroupId
//         `;

//         plantcare.query(sql, (err, results) => {
//             if (err) {
//                 return reject(err);
//             }

//             const groupedData = {};

//             results.forEach((item) => {
//                 const { cropNameEnglish, varietyEnglish, varietyId, cropId } = item;


//                 if (!groupedData[cropNameEnglish]) {
//                     groupedData[cropNameEnglish] = {
//                         cropId: cropId,
//                         variety: [],
//                     };
//                 }

//                 groupedData[cropNameEnglish].variety.push({
//                     id: varietyId,
//                     varietyEnglish: varietyEnglish,
//                 });
//             });

//             const formattedResult = Object.keys(groupedData).map((cropName) => ({
//                 cropId: groupedData[cropName].cropId,
//                 cropNameEnglish: cropName,
//                 variety: groupedData[cropName].variety,
//             }));

//             resolve(formattedResult);
//         });
//     });
// };


// exports.createDailyTargetDao = (target, companyId, userId) => {
//     return new Promise((resolve, reject) => {
//         const sql = `
//            INSERT INTO dailytarget (companyId, fromDate, toDate, fromTime, toTime, createdBy)
//            VALUES (?, ?, ?, ?, ?, ?)
//         `
//         collectionofficer.query(sql, [
//             companyId,
//             target.fromDate,
//             target.toDate,
//             target.fromTime,
//             target.toTime,
//             userId
//         ], (err, results) => {
//             if (err) {
//                 return reject(err);
//             }
//             resolve(results.insertId);
//         });
//     });
// };

// exports.createDailyTargetItemsDao = (data, targetId) => {
//     return new Promise((resolve, reject) => {
//         const sql = `
//            INSERT INTO dailytargetitems (targetId, varietyId, qtyA, qtyB, qtyC)
//            VALUES (?, ?, ?, ?, ?)
//         `
//         collectionofficer.query(sql, [
//             targetId,
//             data.varietyId,
//             data.qtyA,
//             data.qtyB,
//             data.qtyC
//         ], (err, results) => {
//             if (err) {
//                 return reject(err);
//             }
//             resolve(results.insertId);
//         });
//     });
// };


// exports.getAllDailyTargetDAO = (companyId, searchText) => {
//     return new Promise((resolve, reject) => {
//         let targetSql = `
//            SELECT CG.cropNameEnglish, CV.varietyNameEnglish, DTI.qtyA, DTI.qtyB, DTI.qtyC, DT.toDate, DT.toTime, DT.fromTime
//            FROM dailytarget DT, dailytargetitems DTI, \`plant_care\`.cropvariety CV, \`plant_care\`.cropgroup CG
//            WHERE DT.id = DTI.targetId AND DTI.varietyId = CV.id AND CV.cropGroupId = CG.id AND DT.companyId = ?
//         `
//         const sqlParams = [companyId]

//         if (searchText) {
//             const searchCondition =
//                 ` AND  CV.varietyNameEnglish LIKE ? `;
//             targetSql += searchCondition;
//             const searchValue = `%${searchText}%`;
//             sqlParams.push(searchValue);
//         }


//         collectionofficer.query(targetSql, sqlParams, (err, results) => {
//             if (err) {
//                 return reject(err);
//             }
//             const transformedTargetData = results.flatMap(item => [
//                 { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, toDate: item.toDate, toTime: item.toTime, toTime: item.fromTime, qtyA: item.qtyA, grade:"A" },
//                 { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, toDate: item.toDate, toTime: item.toTime, toTime: item.fromTime, qtyB: item.qtyB, grade:"B" },
//                 { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, toDate: item.toDate, toTime: item.toTime, toTime: item.fromTime, qtyC: item.qtyC, grade:"C" }
//             ]);
//             resolve(transformedTargetData);
//         });
//     });
// };


// exports.getAllDailyTargetCompleteDAO = (companyId, searchText) => {
//     return new Promise((resolve, reject) => {
//         let completeSql = `
//             SELECT CG.cropNameEnglish, CV.varietyNameEnglish, SUM(FPC.gradeAquan) AS totA, SUM(FPC.gradeBquan) AS totB, SUM(FPC.gradeCquan) AS totC, FPC.createdAt
//             FROM registeredfarmerpayments RFP, farmerpaymentscrops FPC, collectionofficer CO, \`plant_care\`.cropvariety CV, \`plant_care\`.cropgroup CG
//             WHERE RFP.id = FPC.registerFarmerId AND RFP.collectionOfficerId = CO.id AND FPC.cropId = CV.id AND CV.cropGroupId = CG.id AND CO.companyId = ?
//             GROUP BY CG.cropNameEnglish, CV.varietyNameEnglish

//         `

//         const sqlParams = [companyId]

//         if (searchText) {
//             const searchCondition =
//                 ` AND  CV.varietyNameEnglish LIKE ? `;
//             completeSql += searchCondition;
//             const searchValue = `%${searchText}%`;
//             sqlParams.push(searchValue);
//         }


//         collectionofficer.query(completeSql, sqlParams, (err, results) => {
//             if (err) {
//                 return reject(err);
//             }
//             // console.log(results);

//             const transformedCompleteData = results.flatMap(item => [
//                 { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, totA: item.totA, grade:"A", buyDate:item.createdAt },
//                 { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, totB: item.totB, grade:"B", buyDate:item.createdAt },
//                 { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, totC: item.totC, grade:"C", buyDate:item.createdAt }
//             ]);
//             // console.log(transformedCompleteData);

//             resolve(transformedCompleteData);
//         });
//     });
// };



// exports.downloadAllDailyTargetDao = (companyId, fromDate, toDate) => {
//     return new Promise((resolve, reject) => {
//         let targetSql = `
//            SELECT CG.cropNameEnglish, CV.varietyNameEnglish, DTI.qtyA, DTI.qtyB, DTI.qtyC, DT.toDate, DT.toTime, DT.fromTime
//            FROM dailytarget DT, dailytargetitems DTI, \`plant_care\`.cropvariety CV, \`plant_care\`.cropgroup CG
//            WHERE DT.id = DTI.targetId AND DTI.varietyId = CV.id AND CV.cropGroupId = CG.id AND DT.companyId = ? AND DATE(DT.fromDate) >= ? AND DATE(DT.toDate) <= ?
//         `
//         const sqlParams = [companyId, fromDate, toDate]


//         collectionofficer.query(targetSql, sqlParams, (err, results) => {
//             if (err) {
//                 return reject(err);
//             }
//             const transformedTargetData = results.flatMap(item => [
//                 { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, toDate: item.toDate, toTime: item.toTime, toTime: item.fromTime, qtyA: item.qtyA, grade:"A" },
//                 { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, toDate: item.toDate, toTime: item.toTime, toTime: item.fromTime, qtyB: item.qtyB, grade:"B" },
//                 { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, toDate: item.toDate, toTime: item.toTime, toTime: item.fromTime, qtyC: item.qtyC, grade:"C" }
//             ]);

//             // console.log(transformedTargetData);

//             resolve(transformedTargetData);
//         });
//     });
// };


// exports.downloadAllDailyTargetCompleteDAO = (companyId, fromDate, toDate) => {
//     return new Promise((resolve, reject) => {
//         let completeSql = `
//             SELECT CG.cropNameEnglish, CV.varietyNameEnglish, SUM(FPC.gradeAquan) AS totA, SUM(FPC.gradeBquan) AS totB, SUM(FPC.gradeCquan) AS totC, FPC.createdAt
//             FROM registeredfarmerpayments RFP, farmerpaymentscrops FPC, collectionofficer CO, \`plant_care\`.cropvariety CV, \`plant_care\`.cropgroup CG
//             WHERE RFP.id = FPC.registerFarmerId AND RFP.collectionOfficerId = CO.id AND FPC.cropId = CV.id AND CV.cropGroupId = CG.id AND CO.companyId = ? AND DATE(RFP.createdAt) BETWEEN DATE(?) AND DATE(?)
//             GROUP BY CG.cropNameEnglish, CV.varietyNameEnglish

//         `

//         const sqlParams = [companyId, fromDate, toDate]

//         collectionofficer.query(completeSql, sqlParams, (err, results) => {
//             if (err) {
//                 return reject(err);
//             }
//             // console.log(results);

//             const transformedCompleteData = results.flatMap(item => [
//                 { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, totA: item.totA, grade:"A", buyDate:item.createdAt },
//                 { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, totB: item.totB, grade:"B", buyDate:item.createdAt },
//                 { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, totC: item.totC, grade:"C", buyDate:item.createdAt }
//             ]);
//             // console.log(transformedCompleteData);

//             resolve(transformedCompleteData);
//         });
//     });
// };



// exports.deleteTargetByIdDao = (targetId) => {
//     return new Promise((resolve, reject) => {
//         const sqlDeleteItems = `DELETE FROM dailytargetitems WHERE targetId = ?`;
//         const sqlDeleteTarget = `DELETE FROM dailytarget WHERE id = ?`;

//         // Start Transaction
//         collectionofficer.beginTransaction((err) => {
//             if (err) return reject(err);

//             // Delete items associated with the target
//             collectionofficer.query(sqlDeleteItems, [targetId], (err) => {
//                 if (err) {
//                     return collectionofficer.rollback(() => reject(err));
//                 }

//                 // Delete the target
//                 collectionofficer.query(sqlDeleteTarget, [targetId], (err, results) => {
//                     if (err) {
//                         return collectionofficer.rollback(() => reject(err));
//                     }

//                     collectionofficer.commit((err) => {
//                         if (err) {
//                             return collectionofficer.rollback(() => reject(err));
//                         }
//                         resolve(results);
//                     });
//                 });
//             });
//         });
//     });
// };


// exports.getAllTargetsDao = () => {
//     return new Promise((resolve, reject) => {
//         const sql = `
//             SELECT dt.id AS targetId, dt.companyId, dt.fromDate, dt.toDate, dt.fromTime, dt.toTime, dt.createdBy, dt.createdAt,
//                    dti.id AS itemId, dti.varietyId, dti.qtyA, dti.qtyB, dti.qtyC
//             FROM dailytarget dt
//             LEFT JOIN dailytargetitems dti ON dt.id = dti.targetId
//         `;
//         collectionofficer.query(sql, (err, results) => {
//             if (err) {
//                 return reject(err);
//             }
//             resolve(results);
//         });
//     });
// };


// exports.getTargetsByCompanyIdDao = (centerId) => {
//     return new Promise((resolve, reject) => {
//       const sql = `
//         SELECT 
//           dt.id AS targetId, 
//           dt.centerId, 
//           dt.fromDate, 
//           dt.toDate, 
//           dt.fromTime, 
//           dt.toTime, 
//           dt.createdBy, 
//           dt.createdAt,
//           dti.id AS itemId, 
//           dti.varietyId, 
//           dti.qtyA AS targetA,
//           dti.qtyB AS targetB,
//           dti.qtyC AS targetC,
//           dti.complteQtyA, 
//           dti.complteQtyB, 
//           dti.complteQtyC,
//           (dti.qtyA - dti.complteQtyA) AS todoQtyA,
//           (dti.qtyB - dti.complteQtyB) AS todoQtyB,
//           (dti.qtyC - dti.complteQtyC) AS todoQtyC
//         FROM 
//           dailytarget dt
//         LEFT JOIN 
//           dailytargetitems dti ON dt.id = dti.targetId
//         WHERE 
//           dt.centerId = ?
//         GROUP BY 
//           dti.id, dt.id
//       `;
//       collectionofficer.query(sql, [centerId], (err, results) => {
//         if (err) {
//           return reject(err);
//         }
//         resolve(results);
//       });
//     });
//   };



//   exports.getTargetForOfficerDao = (officerId) => {
//     return new Promise((resolve, reject) => {
//       const sql = `
//         SELECT 
//           odt.varietyId,
//           cv.varietyNameEnglish AS varietyName,
//           odt.grade,
//           odt.target,
//           odt.complete,
//           dt.fromDate,
//           dt.toDate,
//           dt.fromTime,
//           dt.toTime
//         FROM 
//           officerdailytarget odt
//         LEFT JOIN 
//           \`plant_care\`.cropvariety cv ON odt.varietyId = cv.id
//         INNER JOIN
//           dailytarget dt ON odt.dailyTargetId = dt.id
//         WHERE 
//           odt.officerId = ?
//           AND CURDATE() BETWEEN dt.fromDate AND dt.toDate
//           AND (
//             (CURTIME() BETWEEN dt.fromTime AND dt.toTime) 
//             OR 
//             (CURTIME() >= dt.fromTime AND CURTIME() <= dt.toTime)
//           )
//       `;

//       collectionofficer.query(sql, [officerId], (err, results) => {
//         if (err) {
//           return reject(err);
//         }
//         resolve(results);
//         console.log('targets', results);
//       });
//     });
//   };



//   exports.getCenterTargetDao = async (centerId, varietyId, grade) => {
//     return new Promise((resolve, reject) => {
//         console.log("Received grade parameter:", grade);

//         // Map short grade inputs (A, B, C) to actual database columns
//         const gradeMap = {
//             "A": "qtyA",
//             "B": "qtyB",
//             "C": "qtyC",
//             "completedA": "complteQtyA",
//             "completedB": "complteQtyB",
//             "completedC": "complteQtyC"
//         };

//         // Convert received grade to the actual column name
//         const columnName = gradeMap[grade.trim()];

//         if (!columnName) {
//             return reject(new Error(`Invalid grade parameter: ${grade}`));
//         }

//         const query = `
//             SELECT 
//                 dt.centerId,
//                 dti.varietyId,
//                 SUM(dti.${columnName}) AS total_${columnName}
//             FROM dailytargetitems dti
//             JOIN dailytarget dt ON dti.targetId = dt.id
//             WHERE dt.centerId = ? AND dti.varietyId = ?
//             GROUP BY dt.centerId, dti.varietyId;
//         `;

//         collectionofficer.query(query, [centerId, varietyId], (error, results) => {
//             if (error) {
//                 return reject(error);
//             }
//             resolve(results);
//         });
//     });
// };

// exports.getCenterTarget = async (centerId) => {
//     return new Promise((resolve, reject) => {
//       // Construct the query to get data for all grades (A, B, C)
//       const query = `
//         SELECT 
//           dti.varietyId,
//           cv.varietyNameEnglish AS varietyName,  -- Get varietyName from cropvariety table
//           SUM(dti.qtyA) AS qtyA,  
//           SUM(dti.qtyB) AS qtyB, 
//           SUM(dti.qtyC) AS qtyC,  
//           SUM(dti.complteQtyA) AS complteQtyA,  
//           SUM(dti.complteQtyB) AS complteQtyB, 
//           SUM(dti.complteQtyC) AS complteQtyC 
//         FROM dailytargetitems dti
//         JOIN dailytarget dt ON dti.targetId = dt.id
//         JOIN plant_care.cropvariety cv ON dti.varietyId = cv.id 
//         WHERE dt.centerId = ?
//         GROUP BY dti.varietyId, cv.varietyNameEnglish;
//       `;

//       // Execute the query
//       collectionofficer.query(query, [centerId], (error, results) => {
//         if (error) {
//           return reject(error);
//         }

//         // If no results are found, return an empty array
//         if (results.length === 0) {
//           resolve([]);
//         } else {
//           resolve(results);  // Return the query results
//         }
//       });
//     });
//   };


// exports.transferTargetDAO = (fromOfficerId, toOfficerId, varietyId, grade, amount) => {
//     return new Promise((resolve, reject) => {
//         const validGrades = ["A", "B", "C"];
//         if (!validGrades.includes(grade)) {
//             return reject(new Error(`Invalid grade: ${grade}`));
//         }

//         const decrementSql = `
//             UPDATE officerdailytarget 
//             SET target = target - ?
//             WHERE officerId = ? AND varietyId = ? AND grade = ? AND target >= ?;
//         `;

//         const incrementSql = `
//             UPDATE officerdailytarget 
//             SET target = target + ?
//             WHERE officerId = ? AND varietyId = ? AND grade = ?;
//         `;

//         collectionofficer.beginTransaction((err) => {
//             if (err) return reject(err);

//             // Deduct target from the transferring officer
//             collectionofficer.query(decrementSql, [amount, fromOfficerId, varietyId, grade, amount], (err, result) => {
//                 if (err || result.affectedRows === 0) {
//                     return collectionofficer.rollback(() => reject(err || new Error("Insufficient target balance or record not found")));
//                 }

//                 // Increase target for receiving officer
//                 collectionofficer.query(incrementSql, [amount, toOfficerId, varietyId, grade], (err, result) => {
//                     if (err || result.affectedRows === 0) {
//                         return collectionofficer.rollback(() => reject(err || new Error("Receiving officer record not found")));
//                     }

//                     collectionofficer.commit((err) => {
//                         if (err) {
//                             return collectionofficer.rollback(() => reject(err));
//                         }
//                         resolve({ message: "Target transferred successfully" });
//                     });
//                 });
//             });
//         });
//     });
// };


// exports.receiveTargetDAO = (fromOfficerId, toOfficerId, varietyId, grade, amount) => {
//     return new Promise((resolve, reject) => {
//         const validGrades = ["A", "B", "C"];
//         if (!validGrades.includes(grade)) {
//             return reject(new Error(`Invalid grade: ${grade}`));
//         }

//         const decrementSql = `
//             UPDATE officerdailytarget 
//             SET target = target - ?
//             WHERE officerId = ? AND varietyId = ? AND grade = ? AND target >= ?;
//         `;

//         const incrementSql = `
//             UPDATE officerdailytarget 
//             SET target = target + ?
//             WHERE officerId = ? AND varietyId = ? AND grade = ?;
//         `;

//         collectionofficer.beginTransaction((err) => {
//             if (err) return reject(err);

//             // Step 1: Deduct from the sender's target
//             collectionofficer.query(decrementSql, [amount, fromOfficerId, varietyId, grade, amount], (err, result) => {
//                 if (err) {
//                     return collectionofficer.rollback(() => reject(err));
//                 }
//                 if (result.affectedRows === 0) {
//                     return collectionofficer.rollback(() => reject(new Error("Insufficient target balance or sender record not found")));
//                 }

//                 console.log(`✅ Deducted ${amount} from officer ${fromOfficerId}'s target`);

//                 // Step 2: Increase target for the receiving officer
//                 collectionofficer.query(incrementSql, [amount, toOfficerId, varietyId, grade], (err, result) => {
//                     if (err) {
//                         return collectionofficer.rollback(() => reject(err));
//                     }
//                     if (result.affectedRows === 0) {
//                         return collectionofficer.rollback(() => reject(new Error("Receiving officer record not found")));
//                     }

//                     console.log(`✅ Added ${amount} to officer ${toOfficerId}'s target`);

//                     // Step 3: Commit transaction
//                     collectionofficer.commit((err) => {
//                         if (err) {
//                             return collectionofficer.rollback(() => reject(err));
//                         }
//                         resolve({ message: "Target received successfully" });
//                     });
//                 });
//             });
//         });
//     });
// };


// exports.getDailyTargetByOfficerAndVariety = (officerId, varietyId, grade) => {
//     return new Promise((resolve, reject) => {
//         const sql = `
//             SELECT id, dailyTargetId, varietyId, officerId, grade, target, complete, createdAt
//             FROM officerdailytarget
//             WHERE officerId = ? AND varietyId = ? AND grade = ?;
//         `;

//         collectionofficer.query(sql, [officerId, varietyId, grade], (err, results) => {
//             if (err) {
//                 return reject(err);
//             }
//             resolve(results);
//         });
//     });
// };


// exports.getOfficerSummaryDao = async (officerId) => {
//     return new Promise((resolve, reject) => {
//         const query = `
//             SELECT 
//                 COUNT(*) AS totalTasks,
//                 SUM(CASE WHEN complete >= target THEN 1 ELSE 0 END) AS completedTasks
//             FROM officerdailytarget
//             WHERE officerId = ?;
//         `;

//         collectionofficer.query(query, [officerId], (error, results) => {
//             if (error) {
//                 console.error("Database error in getOfficerSummaryDao:", error);
//                 reject(error);
//             } else {
//                 resolve(results[0]); // Return the first row (summary)
//             }
//         });
//     });
// };

// exports.getOfficerSummaryDaoManager = async (collectionOfficerId) => {
//     return new Promise((resolve, reject) => {
//         const query = `
//             SELECT 
//                 COUNT(*) AS totalTasks,
//                 SUM(CASE WHEN complete >= target THEN 1 ELSE 0 END) AS completedTasks
//             FROM officerdailytarget
//             WHERE officerId = ?;
//         `;

//         collectionofficer.query(query, [collectionOfficerId], (error, results) => {
//             if (error) {
//                 console.error("Database error in getOfficerSummaryDao:", error);
//                 reject(error);
//             } else {
//                 resolve(results[0]); // Return the first row (summary)
//             }
//         });
//     });
// };

const { plantcare, collectionofficer, marketPlace, dash } = require('../startup/database');


exports.getAllCropNameDAO = () => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT cg.id AS cropId, cv.id AS varietyId, cg.cropNameEnglish, cv.varietyNameEnglish AS varietyEnglish 
            FROM cropvariety cv, cropgroup cg
            WHERE cg.id = cv.cropGroupId
        `;

        plantcare.query(sql, (err, results) => {
            if (err) {
                return reject(err);
            }

            const groupedData = {};

            results.forEach((item) => {
                const { cropNameEnglish, varietyEnglish, varietyId, cropId } = item;


                if (!groupedData[cropNameEnglish]) {
                    groupedData[cropNameEnglish] = {
                        cropId: cropId,
                        variety: [],
                    };
                }

                groupedData[cropNameEnglish].variety.push({
                    id: varietyId,
                    varietyEnglish: varietyEnglish,
                });
            });

            const formattedResult = Object.keys(groupedData).map((cropName) => ({
                cropId: groupedData[cropName].cropId,
                cropNameEnglish: cropName,
                variety: groupedData[cropName].variety,
            }));

            resolve(formattedResult);
        });
    });
};


exports.createDailyTargetDao = (target, companyId, userId) => {
    return new Promise((resolve, reject) => {
        const sql = `
           INSERT INTO dailytarget (companyId, fromDate, toDate, fromTime, toTime, createdBy)
           VALUES (?, ?, ?, ?, ?, ?)
        `
        collectionofficer.query(sql, [
            companyId,
            target.fromDate,
            target.toDate,
            target.fromTime,
            target.toTime,
            userId
        ], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results.insertId);
        });
    });
};

exports.createDailyTargetItemsDao = (data, targetId) => {
    return new Promise((resolve, reject) => {
        const sql = `
           INSERT INTO dailytargetitems (targetId, varietyId, qtyA, qtyB, qtyC)
           VALUES (?, ?, ?, ?, ?)
        `
        collectionofficer.query(sql, [
            targetId,
            data.varietyId,
            data.qtyA,
            data.qtyB,
            data.qtyC
        ], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results.insertId);
        });
    });
};


exports.getAllDailyTargetDAO = (companyId, searchText) => {
    return new Promise((resolve, reject) => {
        let targetSql = `
           SELECT CG.cropNameEnglish, CV.varietyNameEnglish, DTI.qtyA, DTI.qtyB, DTI.qtyC, DT.toDate, DT.toTime, DT.fromTime
           FROM dailytarget DT, dailytargetitems DTI, \`plant_care\`.cropvariety CV, \`plant_care\`.cropgroup CG
           WHERE DT.id = DTI.targetId AND DTI.varietyId = CV.id AND CV.cropGroupId = CG.id AND DT.companyId = ?
        `
        const sqlParams = [companyId]

        if (searchText) {
            const searchCondition =
                ` AND  CV.varietyNameEnglish LIKE ? `;
            targetSql += searchCondition;
            const searchValue = `%${searchText}%`;
            sqlParams.push(searchValue);
        }


        collectionofficer.query(targetSql, sqlParams, (err, results) => {
            if (err) {
                return reject(err);
            }
            const transformedTargetData = results.flatMap(item => [
                { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, toDate: item.toDate, toTime: item.toTime, toTime: item.fromTime, qtyA: item.qtyA, grade: "A" },
                { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, toDate: item.toDate, toTime: item.toTime, toTime: item.fromTime, qtyB: item.qtyB, grade: "B" },
                { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, toDate: item.toDate, toTime: item.toTime, toTime: item.fromTime, qtyC: item.qtyC, grade: "C" }
            ]);
            resolve(transformedTargetData);
        });
    });
};


exports.getAllDailyTargetCompleteDAO = (companyId, searchText) => {
    return new Promise((resolve, reject) => {
        let completeSql = `
            SELECT CG.cropNameEnglish, CV.varietyNameEnglish, SUM(FPC.gradeAquan) AS totA, SUM(FPC.gradeBquan) AS totB, SUM(FPC.gradeCquan) AS totC, FPC.createdAt
            FROM registeredfarmerpayments RFP, farmerpaymentscrops FPC, collectionofficer CO, \`plant_care\`.cropvariety CV, \`plant_care\`.cropgroup CG
            WHERE RFP.id = FPC.registerFarmerId AND RFP.collectionOfficerId = CO.id AND FPC.cropId = CV.id AND CV.cropGroupId = CG.id AND CO.companyId = ?
            GROUP BY CG.cropNameEnglish, CV.varietyNameEnglish

        `

        const sqlParams = [companyId]

        if (searchText) {
            const searchCondition =
                ` AND  CV.varietyNameEnglish LIKE ? `;
            completeSql += searchCondition;
            const searchValue = `%${searchText}%`;
            sqlParams.push(searchValue);
        }


        collectionofficer.query(completeSql, sqlParams, (err, results) => {
            if (err) {
                return reject(err);
            }
            // console.log(results);

            const transformedCompleteData = results.flatMap(item => [
                { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, totA: item.totA, grade: "A", buyDate: item.createdAt },
                { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, totB: item.totB, grade: "B", buyDate: item.createdAt },
                { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, totC: item.totC, grade: "C", buyDate: item.createdAt }
            ]);
            // console.log(transformedCompleteData);

            resolve(transformedCompleteData);
        });
    });
};



exports.downloadAllDailyTargetDao = (companyId, fromDate, toDate) => {
    return new Promise((resolve, reject) => {
        let targetSql = `
           SELECT CG.cropNameEnglish, CV.varietyNameEnglish, DTI.qtyA, DTI.qtyB, DTI.qtyC, DT.toDate, DT.toTime, DT.fromTime
           FROM dailytarget DT, dailytargetitems DTI, \`plant_care\`.cropvariety CV, \`plant_care\`.cropgroup CG
           WHERE DT.id = DTI.targetId AND DTI.varietyId = CV.id AND CV.cropGroupId = CG.id AND DT.companyId = ? AND DATE(DT.fromDate) >= ? AND DATE(DT.toDate) <= ?
        `
        const sqlParams = [companyId, fromDate, toDate]


        collectionofficer.query(targetSql, sqlParams, (err, results) => {
            if (err) {
                return reject(err);
            }
            const transformedTargetData = results.flatMap(item => [
                { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, toDate: item.toDate, toTime: item.toTime, toTime: item.fromTime, qtyA: item.qtyA, grade: "A" },
                { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, toDate: item.toDate, toTime: item.toTime, toTime: item.fromTime, qtyB: item.qtyB, grade: "B" },
                { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, toDate: item.toDate, toTime: item.toTime, toTime: item.fromTime, qtyC: item.qtyC, grade: "C" }
            ]);

            // console.log(transformedTargetData);

            resolve(transformedTargetData);
        });
    });
};


exports.downloadAllDailyTargetCompleteDAO = (companyId, fromDate, toDate) => {
    return new Promise((resolve, reject) => {
        let completeSql = `
            SELECT CG.cropNameEnglish, CV.varietyNameEnglish, SUM(FPC.gradeAquan) AS totA, SUM(FPC.gradeBquan) AS totB, SUM(FPC.gradeCquan) AS totC, FPC.createdAt
            FROM registeredfarmerpayments RFP, farmerpaymentscrops FPC, collectionofficer CO, \`plant_care\`.cropvariety CV, \`plant_care\`.cropgroup CG
            WHERE RFP.id = FPC.registerFarmerId AND RFP.collectionOfficerId = CO.id AND FPC.cropId = CV.id AND CV.cropGroupId = CG.id AND CO.companyId = ? AND DATE(RFP.createdAt) BETWEEN DATE(?) AND DATE(?)
            GROUP BY CG.cropNameEnglish, CV.varietyNameEnglish

        `

        const sqlParams = [companyId, fromDate, toDate]

        collectionofficer.query(completeSql, sqlParams, (err, results) => {
            if (err) {
                return reject(err);
            }
            // console.log(results);

            const transformedCompleteData = results.flatMap(item => [
                { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, totA: item.totA, grade: "A", buyDate: item.createdAt },
                { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, totB: item.totB, grade: "B", buyDate: item.createdAt },
                { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, totC: item.totC, grade: "C", buyDate: item.createdAt }
            ]);
            // console.log(transformedCompleteData);

            resolve(transformedCompleteData);
        });
    });
};



exports.deleteTargetByIdDao = (targetId) => {
    return new Promise((resolve, reject) => {
        const sqlDeleteItems = `DELETE FROM dailytargetitems WHERE targetId = ?`;
        const sqlDeleteTarget = `DELETE FROM dailytarget WHERE id = ?`;

        // Start Transaction
        collectionofficer.beginTransaction((err) => {
            if (err) return reject(err);

            // Delete items associated with the target
            collectionofficer.query(sqlDeleteItems, [targetId], (err) => {
                if (err) {
                    return collectionofficer.rollback(() => reject(err));
                }

                // Delete the target
                collectionofficer.query(sqlDeleteTarget, [targetId], (err, results) => {
                    if (err) {
                        return collectionofficer.rollback(() => reject(err));
                    }

                    collectionofficer.commit((err) => {
                        if (err) {
                            return collectionofficer.rollback(() => reject(err));
                        }
                        resolve(results);
                    });
                });
            });
        });
    });
};


exports.getAllTargetsDao = () => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT dt.id AS targetId, dt.companyId, dt.fromDate, dt.toDate, dt.fromTime, dt.toTime, dt.createdBy, dt.createdAt,
                   dti.id AS itemId, dti.varietyId, dti.qtyA, dti.qtyB, dti.qtyC
            FROM dailytarget dt
            LEFT JOIN dailytargetitems dti ON dt.id = dti.targetId
        `;
        collectionofficer.query(sql, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};


exports.getTargetsByCompanyIdDao = (centerId) => {
    return new Promise((resolve, reject) => {
        const sql = `
        SELECT 
          dt.id AS targetId, 
          dt.centerId, 
          dt.fromDate, 
          dt.toDate, 
          dt.fromTime, 
          dt.toTime, 
          dt.createdBy, 
          dt.createdAt,
          dti.id AS itemId, 
          dti.varietyId, 
          dti.qtyA AS targetA,
          dti.qtyB AS targetB,
          dti.qtyC AS targetC,
          dti.complteQtyA, 
          dti.complteQtyB, 
          dti.complteQtyC,
          (dti.qtyA - dti.complteQtyA) AS todoQtyA,
          (dti.qtyB - dti.complteQtyB) AS todoQtyB,
          (dti.qtyC - dti.complteQtyC) AS todoQtyC
        FROM 
          dailytarget dt
        LEFT JOIN 
          dailytargetitems dti ON dt.id = dti.targetId
        WHERE 
          dt.centerId = ?
        GROUP BY 
          dti.id, dt.id
      `;
        collectionofficer.query(sql, [centerId], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};



// exports.getTargetForOfficerDao = (officerId) => {
//     return new Promise((resolve, reject) => {
//         if (!officerId) {
//             return reject(new Error("Officer ID is missing or invalid"));
//         }
//         const sql = `
//             SELECT
//                 odt.varietyId,
//                 cv.varietyNameEnglish AS varietyName,
//                 odt.grade,
//                 odt.target,
//                 odt.complete,
//                 dt.fromDate,
//                 dt.toDate,
//                 dt.fromTime,
//                 dt.toTime,
//                 odt.createdAt
//             FROM
//                 officerdailytarget odt
//             INNER JOIN
//                 plant_care.cropvariety cv ON odt.varietyId = cv.id
//             INNER JOIN
//                 dailytarget dt ON odt.dailyTargetId = dt.id
//             WHERE
//                 odt.officerId = ?
//                 AND NOW() BETWEEN CONCAT(dt.fromDate, ' ', dt.fromTime) AND CONCAT(dt.toDate, ' ', dt.toTime)
//         `;
//         collectionofficer.query(sql, [officerId], (err, results) => {
//             if (err) {
//                 console.error("Error executing query:", err);
//                 return reject(err);
//             }
//             console.log("Targets found:", results);
//             resolve(results);
//         });
//     });
// };

exports.getTargetForOfficerDao = (officerId) => {
    return new Promise((resolve, reject) => {
        if (!officerId) {
            return reject(new Error("Officer ID is missing or invalid"));
        }
        const sql = `
            SELECT
                odt.varietyId,
                cv.varietyNameEnglish AS varietyNameEnglish,
                cv.varietyNameSinhala AS varietyNameSinhala,
                cv.varietyNameTamil AS varietyNameTamil,
                odt.grade,
                odt.target,
                odt.complete,
                dt.fromDate,
                dt.toDate,
                dt.fromTime,
                dt.toTime,
                odt.createdAt
            FROM
                officerdailytarget odt
            INNER JOIN
                plant_care.cropvariety cv ON odt.varietyId = cv.id
            INNER JOIN
                dailytarget dt ON odt.dailyTargetId = dt.id
            WHERE
                odt.officerId = ?
                AND NOW() BETWEEN CONCAT(dt.fromDate, ' ', dt.fromTime) AND CONCAT(dt.toDate, ' ', dt.toTime)
        `;
        collectionofficer.query(sql, [officerId], (err, results) => {
            if (err) {
                console.error("Error executing query:", err);
                return reject(err);
            }
            console.log("Targets found:", results);
            resolve(results);
        });
    });
};



exports.getCenterTargetDao = async (centerId, varietyId, grade) => {
    console.log('centerId', centerId);
    console.log('varietyId', varietyId);
    return new Promise((resolve, reject) => {
        console.log("Received grade parameter:", grade);

        // Map short grade inputs (A, B, C) to actual database columns
        const gradeMap = {
            "A": "qtyA",
            "B": "qtyB",
            "C": "qtyC",
            "completedA": "complteQtyA",
            "completedB": "complteQtyB",
            "completedC": "complteQtyC"
        };

        // Convert received grade to the actual column name
        const columnName = gradeMap[grade.trim()];

        if (!columnName) {
            return reject(new Error(`Invalid grade parameter: ${grade}`));
        }

        const query = `
            SELECT 
                dt.centerId,
                dti.varietyId,
                SUM(dti.${columnName}) AS total_${columnName}
            FROM dailytargetitems dti
            JOIN dailytarget dt ON dti.targetId = dt.id
            WHERE dt.centerId = ? AND dti.varietyId = ?
            GROUP BY dt.centerId, dti.varietyId;
        `;

        collectionofficer.query(query, [centerId, varietyId], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
};

exports.getCenterTarget = async (centerId) => {
    return new Promise((resolve, reject) => {
        // Construct the query to get data for all grades (A, B, C)
        const query = `
        SELECT 
          dti.varietyId,
          cv.varietyNameEnglish AS varietyNameEnglish,
          cv.varietyNameSinhala AS varietyNameSinhala,
          cv.varietyNameTamil AS varietyNameTamil,
          SUM(dti.qtyA) AS qtyA,  
          SUM(dti.qtyB) AS qtyB, 
          SUM(dti.qtyC) AS qtyC,  
          SUM(dti.complteQtyA) AS complteQtyA,  
          SUM(dti.complteQtyB) AS complteQtyB, 
          SUM(dti.complteQtyC) AS complteQtyC 
        FROM dailytargetitems dti
        JOIN dailytarget dt ON dti.targetId = dt.id
        JOIN plant_care.cropvariety cv ON dti.varietyId = cv.id 
        WHERE dt.centerId = ?
          GROUP BY dti.varietyId, cv.varietyNameEnglish, cv.varietyNameSinhala, cv.varietyNameTamil;

      `;

        // Execute the query
        collectionofficer.query(query, [centerId], (error, results) => {
            if (error) {
                return reject(error);
            }

            // If no results are found, return an empty array
            if (results.length === 0) {
                resolve([]);
            } else {
                resolve(results);  // Return the query results
            }
        });
    });
};


// exports.transferTargetDAO = (fromOfficerId, toOfficerId, varietyId, grade, amount) => {
//     return new Promise((resolve, reject) => {
//         const validGrades = ["A", "B", "C"];
//         if (!validGrades.includes(grade)) {
//             return reject(new Error(`Invalid grade: ${grade}`));
//         }

//         const decrementSql = `
//             UPDATE officerdailytarget 
//             SET target = target - ?
//             WHERE officerId = ? AND varietyId = ? AND grade = ? AND target >= ?;
//         `;

//         const incrementSql = `
//             UPDATE officerdailytarget 
//             SET target = target + ?
//             WHERE officerId = ? AND varietyId = ? AND grade = ?;
//         `;

//         collectionofficer.beginTransaction((err) => {
//             if (err) return reject(err);

//             // Deduct target from the transferring officer
//             collectionofficer.query(decrementSql, [amount, fromOfficerId, varietyId, grade, amount], (err, result) => {
//                 if (err || result.affectedRows === 0) {
//                     return collectionofficer.rollback(() => reject(err || new Error("Insufficient target balance or record not found")));
//                 }

//                 // Increase target for receiving officer
//                 collectionofficer.query(incrementSql, [amount, toOfficerId, varietyId, grade], (err, result) => {
//                     if (err || result.affectedRows === 0) {
//                         return collectionofficer.rollback(() => reject(err || new Error("Receiving officer record not found")));
//                     }

//                     collectionofficer.commit((err) => {
//                         if (err) {
//                             return collectionofficer.rollback(() => reject(err));
//                         }
//                         resolve({ message: "Target transferred successfully" });
//                     });
//                 });
//             });
//         });
//     });
// };

// exports.transferTargetDAO = (fromOfficerId, toOfficerId, varietyId, grade, amount) => {
//     return new Promise((resolve, reject) => {
//         const validGrades = ["A", "B", "C"];
//         if (!validGrades.includes(grade)) {
//             return reject(new Error(`Invalid grade: ${grade}`));
//         }

//         const decrementSql = `
//             UPDATE officerdailytarget 
//             SET target = target - ?
//             WHERE officerId = ? AND varietyId = ? AND grade = ? AND target >= ?;
//         `;

//         const incrementSql = `
//             UPDATE officerdailytarget 
//             SET target = target + ?
//             WHERE officerId = ? AND varietyId = ? AND grade = ?;
//         `;

//         // Get a connection from the pool
//         collectionofficer.getConnection((err, connection) => {
//             if (err) return reject(err);  // Handle connection error

//             connection.beginTransaction((err) => {
//                 if (err) {
//                     connection.release();  // Release connection on error
//                     return reject(err);
//                 }

//                 // Step 1: Deduct target from the transferring officer
//                 connection.query(decrementSql, [amount, fromOfficerId, varietyId, grade, amount], (err, result) => {
//                     if (err || result.affectedRows === 0) {
//                         connection.rollback(() => {
//                             connection.release();  // Release connection on error
//                             reject(err || new Error("Insufficient target balance or record not found"));
//                         });
//                     } else {
//                         console.log(`✅ Deducted ${amount} from officer ${fromOfficerId}'s target`);

//                         // Step 2: Increase target for the receiving officer
//                         connection.query(incrementSql, [amount, toOfficerId, varietyId, grade], (err, result) => {
//                             if (err || result.affectedRows === 0) {
//                                 connection.rollback(() => {
//                                     connection.release();  // Release connection on error
//                                     reject(err || new Error("Receiving officer record not found"));
//                                 });
//                             } else {
//                                 console.log(`✅ Added ${amount} to officer ${toOfficerId}'s target`);

//                                 // Step 3: Commit transaction
//                                 connection.commit((err) => {
//                                     if (err) {
//                                         connection.rollback(() => {
//                                             connection.release();  // Release connection on error
//                                             reject(err);
//                                         });
//                                     } else {
//                                         connection.release();  // Release connection on success
//                                         resolve({ message: "Target transferred successfully" });
//                                     }
//                                 });
//                             }
//                         });
//                     }
//                 });
//             });
//         });
//     });
// };

exports.transferTargetDAO = (fromOfficerId, toOfficerId, varietyId, grade, amount) => {
    return new Promise((resolve, reject) => {
        const validGrades = ["A", "B", "C"];
        if (!validGrades.includes(grade)) {
            return reject(new Error(`Invalid grade: ${grade}`));
        }

        // SQL queries
        const decrementSql = `
            UPDATE officerdailytarget
            SET target = target - ?
            WHERE officerId = ? AND varietyId = ? AND grade = ? AND target >= ?;
        `;

        const checkReceiverSql = `
            SELECT COUNT(*) as recordExists
            FROM officerdailytarget
            WHERE officerId = ? AND varietyId = ? AND grade = ?;
        `;

        const incrementSql = `
            UPDATE officerdailytarget
            SET target = target + ?
            WHERE officerId = ? AND varietyId = ? AND grade = ?;
        `;

        const getFromOfficerDetailsSql = `
            SELECT dailyTargetId
            FROM officerdailytarget
            WHERE officerId = ? AND varietyId = ? AND grade = ?
            LIMIT 1;
        `;

        const createNewRecordSql = `
            INSERT INTO officerdailytarget
            (dailyTargetId, varietyId, officerId, grade, target, complete)
            VALUES (?, ?, ?, ?, ?, 0);
        `;

        // Get a connection from the pool
        collectionofficer.getConnection((err, connection) => {
            if (err) return reject(err);

            connection.beginTransaction((err) => {
                if (err) {
                    connection.release();
                    return reject(err);
                }

                // Step 1: Deduct target from the transferring officer
                connection.query(decrementSql, [amount, fromOfficerId, varietyId, grade, amount], (err, result) => {
                    if (err || result.affectedRows === 0) {
                        return connection.rollback(() => {
                            connection.release();
                            reject(err || new Error("Insufficient target balance or record not found"));
                        });
                    }

                    console.log(`✅ Deducted ${amount} from officer ${fromOfficerId}'s target`);

                    // Step 2: Check if receiving officer has a record for this variety and grade
                    connection.query(checkReceiverSql, [toOfficerId, varietyId, grade], (err, results) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                reject(err);
                            });
                        }

                        const receiverHasRecord = results[0].recordExists > 0;

                        if (receiverHasRecord) {
                            // Step 3A: If record exists, just update it
                            connection.query(incrementSql, [amount, toOfficerId, varietyId, grade], (err, result) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        reject(err);
                                    });
                                }

                                console.log(`✅ Added ${amount} to officer ${toOfficerId}'s target`);

                                // Commit transaction
                                connection.commit((err) => {
                                    if (err) {
                                        return connection.rollback(() => {
                                            connection.release();
                                            reject(err);
                                        });
                                    }

                                    connection.release();
                                    resolve({ message: "Target transferred successfully" });
                                });
                            });
                        } else {
                            // Step 3B: Get the dailyTargetId from source officer's record
                            connection.query(getFromOfficerDetailsSql, [fromOfficerId, varietyId, grade], (err, results) => {
                                if (err || results.length === 0) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        reject(err || new Error("Source officer record not found"));
                                    });
                                }

                                const dailyTargetId = results[0].dailyTargetId;

                                // Step 3C: Create a new record for the receiving officer
                                connection.query(createNewRecordSql, [dailyTargetId, varietyId, toOfficerId, grade, amount], (err, result) => {
                                    if (err) {
                                        return connection.rollback(() => {
                                            connection.release();
                                            reject(err);
                                        });
                                    }

                                    console.log(`✅ Created new record for officer ${toOfficerId} with target ${amount}`);

                                    // Commit transaction
                                    connection.commit((err) => {
                                        if (err) {
                                            return connection.rollback(() => {
                                                connection.release();
                                                reject(err);
                                            });
                                        }

                                        connection.release();
                                        resolve({ message: "Target transferred successfully with new record creation" });
                                    });
                                });
                            });
                        }
                    });
                });
            });
        });
    });
};


// exports.receiveTargetDAO = (fromOfficerId, toOfficerId, varietyId, grade, amount) => {
//     return new Promise((resolve, reject) => {
//         const validGrades = ["A", "B", "C"];
//         if (!validGrades.includes(grade)) {
//             return reject(new Error(`Invalid grade: ${grade}`));
//         }

//         const decrementSql = `
//             UPDATE officerdailytarget 
//             SET target = target - ?
//             WHERE officerId = ? AND varietyId = ? AND grade = ? AND target >= ?;
//         `;

//         const incrementSql = `
//             UPDATE officerdailytarget 
//             SET target = target + ?
//             WHERE officerId = ? AND varietyId = ? AND grade = ?;
//         `;

//         collectionofficer.beginTransaction((err) => {
//             if (err) return reject(err);

//             // Step 1: Deduct from the sender's target
//             collectionofficer.query(decrementSql, [amount, fromOfficerId, varietyId, grade, amount], (err, result) => {
//                 if (err) {
//                     return collectionofficer.rollback(() => reject(err));
//                 }
//                 if (result.affectedRows === 0) {
//                     return collectionofficer.rollback(() => reject(new Error("Insufficient target balance or sender record not found")));
//                 }

//                 console.log(`✅ Deducted ${amount} from officer ${fromOfficerId}'s target`);

//                 // Step 2: Increase target for the receiving officer
//                 collectionofficer.query(incrementSql, [amount, toOfficerId, varietyId, grade], (err, result) => {
//                     if (err) {
//                         return collectionofficer.rollback(() => reject(err));
//                     }
//                     if (result.affectedRows === 0) {
//                         return collectionofficer.rollback(() => reject(new Error("Receiving officer record not found")));
//                     }

//                     console.log(`✅ Added ${amount} to officer ${toOfficerId}'s target`);

//                     // Step 3: Commit transaction
//                     collectionofficer.commit((err) => {
//                         if (err) {
//                             return collectionofficer.rollback(() => reject(err));
//                         }
//                         resolve({ message: "Target received successfully" });
//                     });
//                 });
//             });
//         });
//     });
// };

exports.receiveTargetDAO = (fromOfficerId, toOfficerId, varietyId, grade, amount) => {
    return new Promise((resolve, reject) => {
        const validGrades = ["A", "B", "C"];
        if (!validGrades.includes(grade)) {
            return reject(new Error(`Invalid grade: ${grade}`));
        }

        const decrementSql = `
            UPDATE officerdailytarget 
            SET target = target - ?
            WHERE officerId = ? AND varietyId = ? AND grade = ? AND target >= ?;
        `;

        const incrementSql = `
            UPDATE officerdailytarget 
            SET target = target + ?
            WHERE officerId = ? AND varietyId = ? AND grade = ?;
        `;

        // Get a connection from the pool
        collectionofficer.getConnection((err, connection) => {
            if (err) return reject(err);  // Handle connection error

            connection.beginTransaction((err) => {
                if (err) {
                    connection.release();  // Release connection on error
                    return reject(err);
                }

                // Step 1: Deduct from the sender's target
                connection.query(decrementSql, [amount, fromOfficerId, varietyId, grade, amount], (err, result) => {
                    if (err) {
                        connection.rollback(() => {
                            connection.release();  // Release connection on error
                            reject(err);
                        });
                    } else if (result.affectedRows === 0) {
                        connection.rollback(() => {
                            connection.release();  // Release connection on error
                            reject(new Error("Insufficient target balance or sender record not found"));
                        });
                    } else {
                        console.log(`✅ Deducted ${amount} from officer ${fromOfficerId}'s target`);

                        // Step 2: Increase target for the receiving officer
                        connection.query(incrementSql, [amount, toOfficerId, varietyId, grade], (err, result) => {
                            if (err) {
                                connection.rollback(() => {
                                    connection.release();  // Release connection on error
                                    reject(err);
                                });
                            } else if (result.affectedRows === 0) {
                                connection.rollback(() => {
                                    connection.release();  // Release connection on error
                                    reject(new Error("Receiving officer record not found"));
                                });
                            } else {
                                console.log(`✅ Added ${amount} to officer ${toOfficerId}'s target`);

                                // Step 3: Commit transaction
                                connection.commit((err) => {
                                    if (err) {
                                        connection.rollback(() => {
                                            connection.release();  // Release connection on error
                                            reject(err);
                                        });
                                    } else {
                                        connection.release();  // Release connection on success
                                        resolve({ message: "Target received successfully" });
                                    }
                                });
                            }
                        });
                    }
                });
            });
        });
    });
};



exports.getDailyTargetByOfficerAndVariety = (officerId, varietyId, grade) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT id, dailyTargetId, varietyId, officerId, grade, target, complete, createdAt
            FROM officerdailytarget
            WHERE officerId = ? AND varietyId = ? AND grade = ?;
        `;

        collectionofficer.query(sql, [officerId, varietyId, grade], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};


exports.getOfficerSummaryDao = async (officerId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                COUNT(*) AS totalTasks,
                SUM(CASE WHEN complete >= target THEN 1 ELSE 0 END) AS completedTasks
            FROM officerdailytarget
            WHERE officerId = ?;
        `;

        collectionofficer.query(query, [officerId], (error, results) => {
            if (error) {
                console.error("Database error in getOfficerSummaryDao:", error);
                reject(error);
            } else {
                resolve(results[0]); // Return the first row (summary)
            }
        });
    });
};

exports.getOfficerSummaryDaoManager = async (collectionOfficerId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                COUNT(*) AS totalTasks,
                SUM(CASE WHEN complete >= target THEN 1 ELSE 0 END) AS completedTasks
            FROM officerdailytarget
            WHERE officerId = ?;
        `;

        collectionofficer.query(query, [collectionOfficerId], (error, results) => {
            if (error) {
                console.error("Database error in getOfficerSummaryDao:", error);
                reject(error);
            } else {
                resolve(results[0]); // Return the first row (summary)
            }
        });
    });
};

