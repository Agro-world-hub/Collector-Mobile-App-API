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
           FROM dailytarget DT, dailytargetitems DTI, \`plant-care\`.cropvariety CV, \`plant-care\`.cropgroup CG
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
                { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, toDate: item.toDate, toTime: item.toTime, toTime: item.fromTime, qtyA: item.qtyA, grade:"A" },
                { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, toDate: item.toDate, toTime: item.toTime, toTime: item.fromTime, qtyB: item.qtyB, grade:"B" },
                { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, toDate: item.toDate, toTime: item.toTime, toTime: item.fromTime, qtyC: item.qtyC, grade:"C" }
            ]);
            resolve(transformedTargetData);
        });
    });
};


exports.getAllDailyTargetCompleteDAO = (companyId, searchText) => {
    return new Promise((resolve, reject) => {
        let completeSql = `
            SELECT CG.cropNameEnglish, CV.varietyNameEnglish, SUM(FPC.gradeAquan) AS totA, SUM(FPC.gradeBquan) AS totB, SUM(FPC.gradeCquan) AS totC, FPC.createdAt
            FROM registeredfarmerpayments RFP, farmerpaymentscrops FPC, collectionofficer CO, \`plant-care\`.cropvariety CV, \`plant-care\`.cropgroup CG
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
                { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, totA: item.totA, grade:"A", buyDate:item.createdAt },
                { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, totB: item.totB, grade:"B", buyDate:item.createdAt },
                { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, totC: item.totC, grade:"C", buyDate:item.createdAt }
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
           FROM dailytarget DT, dailytargetitems DTI, \`plant-care\`.cropvariety CV, \`plant-care\`.cropgroup CG
           WHERE DT.id = DTI.targetId AND DTI.varietyId = CV.id AND CV.cropGroupId = CG.id AND DT.companyId = ? AND DATE(DT.fromDate) >= ? AND DATE(DT.toDate) <= ?
        `
        const sqlParams = [companyId, fromDate, toDate]


        collectionofficer.query(targetSql, sqlParams, (err, results) => {
            if (err) {
                return reject(err);
            }
            const transformedTargetData = results.flatMap(item => [
                { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, toDate: item.toDate, toTime: item.toTime, toTime: item.fromTime, qtyA: item.qtyA, grade:"A" },
                { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, toDate: item.toDate, toTime: item.toTime, toTime: item.fromTime, qtyB: item.qtyB, grade:"B" },
                { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, toDate: item.toDate, toTime: item.toTime, toTime: item.fromTime, qtyC: item.qtyC, grade:"C" }
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
            FROM registeredfarmerpayments RFP, farmerpaymentscrops FPC, collectionofficer CO, \`plant-care\`.cropvariety CV, \`plant-care\`.cropgroup CG
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
                { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, totA: item.totA, grade:"A", buyDate:item.createdAt },
                { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, totB: item.totB, grade:"B", buyDate:item.createdAt },
                { cropNameEnglish: item.cropNameEnglish, varietyNameEnglish: item.varietyNameEnglish, totC: item.totC, grade:"C", buyDate:item.createdAt }
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
  

  
  exports.getTargetForOfficerDao = (officerId) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          odt.varietyId,
          cv.varietyNameEnglish AS varietyName,
          odt.grade,
          odt.target,
          odt.complete,
          dt.fromDate,
          dt.toDate,
          dt.fromTime,
          dt.toTime
        FROM 
          officerdailytarget odt
        LEFT JOIN 
          \`plant-care\`.cropvariety cv ON odt.varietyId = cv.id
        INNER JOIN
          dailytarget dt ON odt.dailyTargetId = dt.id
        WHERE 
          odt.officerId = ?
          AND CURDATE() BETWEEN dt.fromDate AND dt.toDate
          AND CURTIME() BETWEEN dt.fromTime AND dt.toTime
      `;
  
      collectionofficer.query(sql, [officerId], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  };
  
  
  exports.getCenterTargetDao = async (centerId, varietyId, grade) => {
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