const jwt = require("jsonwebtoken");
const db = require("../startup/database");


// exports.getAllCollectionRequest = (status, requestStatus,  userId) => {
//     return new Promise((resolve, reject) => {
//         // Enhanced query to join farmer details
//         let query = `
//             SELECT 
//                 cr.id, 
//                 cr.farmerId, 
//                 f.firstName AS firstName,
//                 f.NICnumber As NICnumber,
//                 f.route AS farmerRoute,
//                 cr.centerId, 
//                 cr.companyId, 
//                 cr.scheduleDate,
//                 cr.createdAt, 
//                 cr.requestStatus, 
//                 cr.assignedStatus
//             FROM collection_officer.collectionrequest cr
//             LEFT JOIN plant_care.users f ON cr.farmerId = f.id
//             WHERE cr.cmId= ?
//         `;

//         const queryParams = [userId];

//         // Add date filter to get only today's requests - REMOVING this filter to see all records
//         // query += ` AND DATE(cr.createdAt) = CURDATE()`;

//         // Add status filter if provided - handle Assigned status correctly
//         if (status && status !== 'No status filter') {
//             if (status === 'Assigned') {
//                 // For Assigned status, look for any record with a non-null assignedStatus
//                 // OR where requestStatus is explicitly set to 'Assigned'
//                 query += ` AND (cr.assignedStatus IS NOT NULL 
//                               OR cr.requestStatus = 'Assigned')`;
//             } else if (status === 'Not Assigned') {
//                 // For Not Assigned, look for records with null assignedStatus
//                 // AND requestStatus specifically set to 'Not Assigned'
//                 query += ` AND (cr.assignedStatus IS NULL 
//                               AND cr.requestStatus = 'Not Assigned')`;
//             } else {
//                 // For any other specific status
//                 query += ` AND cr.requestStatus = ?`;
//                 queryParams.push(status);
//             }
//         }

//         // Add assignedStatus filter if provided (specific assigned status like 'Collected', 'On way', etc.)
//         if (requestStatus && requestStatus !== 'No requestStatus filter') {
//             query += ` AND cr.assignedStatus = ?`;
//             queryParams.push(requestStatus);
//         }

//         // Add ORDER BY to sort results
//         query += ` ORDER BY cr.createdAt DESC`;

//         console.log('Executing Query:', query);
//         console.log('Query Params:', queryParams);

//         db.plantcare.query(query, queryParams, (error, results) => {
//             if (error) {
//                 console.error('Database Query Error:', error);
//                 return reject(error);
//             }

//             if (!results || results.length === 0) {
//                 return resolve([]);
//             }

//             // Get all request IDs to fetch their items
//             const requestIds = results.map(result => result.id);

//             // Query to get all items for these requests
//             const itemsQuery = `
//                 SELECT * 
//                 FROM collection_officer.collectionrequestitems 
//                 WHERE requestId IN (?)
//             `;

//             db.plantcare.query(itemsQuery, [requestIds], (itemsError, itemsResults) => {
//                 if (itemsError) {
//                     console.error('Database Items Query Error:', itemsError);
//                     return reject(itemsError);
//                 }

//                 // Group items by requestId
//                 const itemsByRequestId = {};
//                 itemsResults.forEach(item => {
//                     if (!itemsByRequestId[item.requestId]) {
//                         itemsByRequestId[item.requestId] = [];
//                     }
//                     itemsByRequestId[item.requestId].push({
//                         itemId: item.id,
//                         cropId: item.cropId,
//                         varietyId: item.varietyId,
//                         loadWeight: item.loadWeight
//                     });
//                 });

//                 // Transform results to match frontend expectations
//                 const transformedResults = results.map(result => ({
//                     id: result.id,
//                     name: result.firstName || `Farmer ${result.farmerId}`,
//                     route: result.farmerRoute || `Route ${result.farmerId}`,
//                     nic: result.NICnumber || `NIC ${result.NICnumber}`,
//                     farmerId: result.farmerId,
//                     scheduleDate: result.scheduleDate,
//                     requestStatus: result.requestStatus,
//                     assignedStatus: result.assignedStatus,
//                     items: itemsByRequestId[result.id] || []
//                 }));

//                 console.log('Transformed Query Results:', transformedResults);
//                 resolve(transformedResults);
//             });
//         });
//     });
// };

exports.getAllCollectionRequest = (status, requestStatus, userId) => {
    return new Promise((resolve, reject) => {
        db.plantcare.getConnection((connErr, connection) => {
            if (connErr) {
                console.error('Connection Error:', connErr);
                return reject(connErr);
            }

            let query = `
                SELECT 
                    cr.id, 
                    cr.farmerId, 
                    f.firstName AS firstName,
                    f.NICnumber AS NICnumber,
                    f.route AS farmerRoute,
                    cr.centerId, 
                    cr.companyId, 
                    cr.scheduleDate,
                    cr.createdAt, 
                    cr.requestStatus, 
                    cr.assignedStatus
                FROM collection_officer.collectionrequest cr
                LEFT JOIN plant_care.users f ON cr.farmerId = f.id
                WHERE cr.cmId = ?
            `;

            const queryParams = [userId];

            if (status && status !== 'No status filter') {
                if (status === 'Assigned') {
                    query += ` AND (cr.assignedStatus IS NOT NULL OR cr.requestStatus = 'Assigned')`;
                } else if (status === 'Not Assigned') {
                    query += ` AND (cr.assignedStatus IS NULL AND cr.requestStatus = 'Not Assigned')`;
                } else {
                    query += ` AND cr.requestStatus = ?`;
                    queryParams.push(status);
                }
            }

            if (requestStatus && requestStatus !== 'No requestStatus filter') {
                query += ` AND cr.assignedStatus = ?`;
                queryParams.push(requestStatus);
            }

            query += ` ORDER BY cr.createdAt DESC`;

            console.log('Executing Query:', query);
            console.log('Query Params:', queryParams);

            connection.query(query, queryParams, (error, results) => {
                if (error) {
                    connection.release();
                    console.error('Database Query Error:', error);
                    return reject(error);
                }

                if (!results || results.length === 0) {
                    connection.release();
                    return resolve([]);
                }

                const requestIds = results.map(result => result.id);

                const itemsQuery = `
                    SELECT * 
                    FROM collection_officer.collectionrequestitems 
                    WHERE requestId IN (?)
                `;

                connection.query(itemsQuery, [requestIds], (itemsError, itemsResults) => {
                    connection.release(); // Ensure release after last query

                    if (itemsError) {
                        console.error('Database Items Query Error:', itemsError);
                        return reject(itemsError);
                    }

                    const itemsByRequestId = {};
                    itemsResults.forEach(item => {
                        if (!itemsByRequestId[item.requestId]) {
                            itemsByRequestId[item.requestId] = [];
                        }
                        itemsByRequestId[item.requestId].push({
                            itemId: item.id,
                            cropId: item.cropId,
                            varietyId: item.varietyId,
                            loadWeight: item.loadWeight
                        });
                    });

                    const transformedResults = results.map(result => ({
                        id: result.id,
                        name: result.firstName || `Farmer ${result.farmerId}`,
                        route: result.farmerRoute || `Route ${result.farmerId}`,
                        nic: result.NICnumber || `NIC ${result.farmerId}`,
                        farmerId: result.farmerId,
                        scheduleDate: result.scheduleDate,
                        requestStatus: result.requestStatus,
                        assignedStatus: result.assignedStatus,
                        items: itemsByRequestId[result.id] || []
                    }));

                    console.log('Transformed Query Results:', transformedResults);
                    resolve(transformedResults);
                });
            });
        });
    });
};


// exports.getViewDetailsById = (requestId) => {
//     return new Promise((resolve, reject) => {
//         // Query to fetch the collection request and related farmer details 
//         const query = ` 
//             SELECT  
//                 cr.id,  
//                 cr.farmerId,  
//                 f.firstName AS firstName, 
//                 f.NICnumber AS NICnumber, 
//                 f.route AS farmerRoute, 
//                 f.city AS city, 
//                 f.streetName AS streetName, 
//                 f.houseNo AS houseNo, 
//                 cr.centerId,  
//                 cr.companyId,  
//                 cr.scheduleDate, 
//                 cr.createdAt,  
//                 cr.requestStatus,  
//                 cr.assignedStatus ,
//                 cr.requestId AS reqId
//             FROM collection_officer.collectionrequest cr 
//             LEFT JOIN plant_care.users f ON cr.farmerId = f.id 
//             WHERE cr.id = ? 
//         `;

//         db.plantcare.query(query, [requestId], (error, results) => {
//             if (error) {
//                 console.error('Database Query Error:', error);
//                 return reject(error);
//             }

//             if (!results || results.length === 0) {
//                 return resolve(null);
//             }

//             // Get all items for this request and join cropgroup and cropvariety to fetch names
//             const itemsQuery = ` 
//                 SELECT 
//                     ri.id, 
//                     ri.cropId, 
//                     ri.varietyId, 
//                     ri.loadWeight, 
//                     cg.cropNameEnglish, 
//                     cg.cropNameSinhala,
//                     cg.cropNameTamil,
//                     cv.varietyNameTamil,
//                     cv.varietyNameSinhala,
//                     cv.varietyNameEnglish 
//                 FROM collection_officer.collectionrequestitems ri
//                 LEFT JOIN plant_care.cropgroup cg ON ri.cropId = cg.id
//                 LEFT JOIN plant_care.cropvariety cv ON ri.varietyId = cv.id
//                 WHERE ri.requestId = ? 
//             `;

//             db.plantcare.query(itemsQuery, [requestId], (itemsError, itemsResults) => {
//                 if (itemsError) {
//                     console.error('Database Items Query Error:', itemsError);
//                     return reject(itemsError);
//                 }

//                 // Format the response with items and the additional fields for crop and variety names
//                 const requestDetails = results[0];
//                 const formattedResponse = {
//                     id: requestDetails.id,
//                     name: requestDetails.firstName || `Farmer ${requestDetails.farmerId}`,
//                     route: requestDetails.farmerRoute || `Route ${requestDetails.farmerId}`,
//                     nic: requestDetails.NICnumber || `NIC ${requestDetails.farmerId}`,
//                     farmerId: requestDetails.farmerId,
//                     scheduleDate: requestDetails.scheduleDate,
//                     requestStatus: requestDetails.requestStatus,
//                     assignedStatus: requestDetails.assignedStatus,
//                     city: requestDetails.city,
//                     streetName: requestDetails.streetName,
//                     houseNo: requestDetails.houseNo,
//                     requestID : requestDetails.reqId,
//                     items: itemsResults.map(item => ({
//                         itemId: item.id,
//                         cropId: item.cropId,
//                         cropName: item.cropNameEnglish, // Adding cropNameEnglish from cropgroup
//                         cropNameSinhala: item.cropNameSinhala,
//                         cropNameTamil: item.cropNameTamil,
//                         varietyNameTamil: item.varietyNameTamil,
//                         varietyNameSinhala: item.varietyNameSinhala,
//                         varietyId: item.varietyId,
//                         varietyName: item.varietyNameEnglish, // Adding varietyNameEnglish from cropvariety
//                         loadWeight: item.loadWeight
//                     }))
//                 };

//                 resolve(formattedResponse);
//                 console.log('Formatted Response:', formattedResponse);
//             });
//         });
//     });
// };

exports.getViewDetailsById = (requestId) => {
    return new Promise((resolve, reject) => {
        db.plantcare.getConnection((connErr, connection) => {
            if (connErr) {
                console.error('Connection Error:', connErr);
                return reject(connErr);
            }

            const query = ` 
                SELECT  
                    cr.id,  
                    cr.farmerId,  
                    f.firstName AS firstName, 
                    f.NICnumber AS NICnumber, 
                    f.route AS farmerRoute, 
                    f.city AS city, 
                    f.streetName AS streetName, 
                    f.houseNo AS houseNo, 
                    cr.centerId,  
                    cr.companyId,  
                    cr.scheduleDate, 
                    cr.createdAt,  
                    cr.requestStatus,  
                    cr.assignedStatus,
                    cr.requestId AS reqId
                FROM collection_officer.collectionrequest cr 
                LEFT JOIN plant_care.users f ON cr.farmerId = f.id 
                WHERE cr.id = ? 
            `;

            connection.query(query, [requestId], (error, results) => {
                if (error) {
                    connection.release();
                    console.error('Database Query Error:', error);
                    return reject(error);
                }

                if (!results || results.length === 0) {
                    connection.release();
                    return resolve(null);
                }

                const itemsQuery = ` 
                    SELECT 
                        ri.id, 
                        ri.cropId, 
                        ri.varietyId, 
                        ri.loadWeight, 
                        cg.cropNameEnglish, 
                        cg.cropNameSinhala,
                        cg.cropNameTamil,
                        cv.varietyNameTamil,
                        cv.varietyNameSinhala,
                        cv.varietyNameEnglish 
                    FROM collection_officer.collectionrequestitems ri
                    LEFT JOIN plant_care.cropgroup cg ON ri.cropId = cg.id
                    LEFT JOIN plant_care.cropvariety cv ON ri.varietyId = cv.id
                    WHERE ri.requestId = ? 
                `;

                connection.query(itemsQuery, [requestId], (itemsError, itemsResults) => {
                    connection.release(); // Always release after the last query

                    if (itemsError) {
                        console.error('Database Items Query Error:', itemsError);
                        return reject(itemsError);
                    }

                    const requestDetails = results[0];
                    const formattedResponse = {
                        id: requestDetails.id,
                        name: requestDetails.firstName || `Farmer ${requestDetails.farmerId}`,
                        route: requestDetails.farmerRoute || `Route ${requestDetails.farmerId}`,
                        nic: requestDetails.NICnumber || `NIC ${requestDetails.farmerId}`,
                        farmerId: requestDetails.farmerId,
                        scheduleDate: requestDetails.scheduleDate,
                        requestStatus: requestDetails.requestStatus,
                        assignedStatus: requestDetails.assignedStatus,
                        city: requestDetails.city,
                        streetName: requestDetails.streetName,
                        houseNo: requestDetails.houseNo,
                        requestID: requestDetails.reqId,
                        items: (itemsResults || []).map(item => ({
                            itemId: item.id,
                            cropId: item.cropId,
                            cropName: item.cropNameEnglish,
                            cropNameSinhala: item.cropNameSinhala,
                            cropNameTamil: item.cropNameTamil,
                            varietyNameTamil: item.varietyNameTamil,
                            varietyNameSinhala: item.varietyNameSinhala,
                            varietyId: item.varietyId,
                            varietyName: item.varietyNameEnglish,
                            loadWeight: item.loadWeight
                        }))
                    };

                    console.log('Formatted Response:', formattedResponse);
                    resolve(formattedResponse);
                });
            });
        });
    });
};


exports.updateCollectionRequest = async (requestId, scheduleDate) => {
    return new Promise((resolve, reject) => {
      const updateQuery = `
        UPDATE collectionrequest 
        SET scheduleDate = ? 
        WHERE id = ?
      `;
  
      db.collectionofficer.query(updateQuery, [scheduleDate, requestId], (err, results) => {
        if (err) {
          console.error('Error updating schedule date:', err);
          reject(new Error('Database query failed'));
          return;
        }
  
        // Check if any rows were actually updated
        // if (results.changedRows === 0) {
        //   resolve({ success: false, message: 'Schedule date is already up-to-date.' });
        //   return;
        // }
  
        resolve({ success: true, message: 'Schedule date updated successfully.' });
      });
    });
  };  



  exports.cancelRequest = async (requestId, cancelReason, userId) => {
    console.log('Cancel Request Function Hit', cancelReason, userId, requestId);
    
    return new Promise((resolve, reject) => {
        const updateQuery = `
            UPDATE collectionrequest 
            SET cancelReason = ?, 
                cancelStatus = 1, 
                assignedStatus = 'Cancelled',
                cancelBy = ?
            WHERE id = ?
        `;

        db.collectionofficer.query(updateQuery, [cancelReason, userId, requestId], (err, result) => {
            if (err) {
                console.error('Query Error:', err);
                return reject({ success: false, message: 'Database error', error: err });
            }
            resolve({ success: true, message: 'Request cancelled successfully.' });
        });
    });
};
