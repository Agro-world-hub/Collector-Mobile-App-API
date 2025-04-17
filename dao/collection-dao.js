const jwt = require("jsonwebtoken");
const db = require("../startup/database");

// exports.getAllCollectionRequest = (status, assignedStatus) => {
//     return new Promise((resolve, reject) => {
//         // Default query to fetch all collection requests for today
//         let query = `
//             SELECT 
//                 id, 
//                 farmerId, 
//                 centerId, 
//                 companyId, 
//                 cropId, 
//                 varietyId, 
//                 loadWeight, 
//                 createdAt, 
//                 requestStatus, 
//                 assignedStatus 
//             FROM collectionrequest 
//             WHERE 1=1
//         `;

//         const queryParams = [];

//         // Add date filter to get only today's requests
//         query += ` AND DATE(createdAt) = CURDATE()`;

//         // Add status filter if provided
//         if (status) {
//             query += ` AND requestStatus = ?`;
//             queryParams.push(status);
//         }

//         // Add assignedStatus filter if provided
//         if (assignedStatus) {
//             query += ` AND assignedStatus = ?`;
//             queryParams.push(assignedStatus);
//         }

//         // Add ORDER BY to sort results
//         query += ` ORDER BY createdAt DESC`;

//         console.log('Executing Query:', query);
//         console.log('Query Params:', queryParams);

//         db.collectionofficer.query(query, queryParams, (error, results) => {
//             if (error) {
//                 console.error('Database Query Error:', error);
//                 return reject(error);
//             }

//             console.log('Query Results:', results);
//             resolve(results);
//         });
//     });
// };


// exports.getAllCollectionRequest = (status, requestStatus) => {
//     return new Promise((resolve, reject) => {
//         // Enhanced query to join farmer details
//         let query = `
//             SELECT 
//                 cr.id, 
//                 cr.farmerId, 
//                 f.firstName AS firstName,
//                 f.route AS farmerRoute,
//                 cr.centerId, 
//                 cr.companyId, 
//                 cr.scheduleDate,
//                 cr.createdAt, 
//                 cr.requestStatus, 
//                 cr.assignedStatus
//             FROM collection_officer.collectionrequest cr
//             LEFT JOIN plant_care.users f ON cr.farmerId = f.id
//             WHERE 1=1
//         `;

//         const queryParams = [];

//         // Add date filter to get only today's requests
//         query += ` AND DATE(cr.createdAt) = CURDATE()`;

//         // Add status filter if provided
//         if (status && status !== 'No status filter') {
//             query += ` AND cr.requestStatus = ?`;
//             queryParams.push(status);
//         }

//         // Add requestStatus filter if provided
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

// exports.getAllCollectionRequest = (status, requestStatus) => {
//     return new Promise((resolve, reject) => {
//         // Enhanced query to join farmer details
//         let query = `
//             SELECT 
//                 cr.id, 
//                 cr.farmerId, 
//                 f.firstName AS firstName,
//                 f.route AS farmerRoute,
//                 cr.centerId, 
//                 cr.companyId, 
//                 cr.scheduleDate,
//                 cr.createdAt, 
//                 cr.requestStatus, 
//                 cr.assignedStatus
//             FROM collection_officer.collectionrequest cr
//             LEFT JOIN plant_care.users f ON cr.farmerId = f.id
//             WHERE 1=1
//         `;

//         const queryParams = [];

//         // Add date filter to get only today's requests
//         query += ` AND DATE(cr.createdAt) = CURDATE()`;

//         // Add status filter if provided - handle Assigned status correctly
//         if (status && status !== 'No status filter') {
//             if (status === 'Assigned') {
//                 // For Assigned status, we need to check if assignedStatus is not NULL
//                 query += ` AND cr.assignedStatus IS NOT NULL AND cr.assignedStatus != ''`;
//             } else {
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

exports.getAllCollectionRequest = (status, requestStatus,  userId) => {
    return new Promise((resolve, reject) => {
        // Enhanced query to join farmer details
        let query = `
            SELECT 
                cr.id, 
                cr.farmerId, 
                f.firstName AS firstName,
                f.NICnumber As NICnumber,
                f.route AS farmerRoute,
                cr.centerId, 
                cr.companyId, 
                cr.scheduleDate,
                cr.createdAt, 
                cr.requestStatus, 
                cr.assignedStatus
            FROM collection_officer.collectionrequest cr
            LEFT JOIN plant_care.users f ON cr.farmerId = f.id
            WHERE cr.cmId= ?
        `;

        const queryParams = [userId];

        // Add date filter to get only today's requests - REMOVING this filter to see all records
        // query += ` AND DATE(cr.createdAt) = CURDATE()`;

        // Add status filter if provided - handle Assigned status correctly
        if (status && status !== 'No status filter') {
            if (status === 'Assigned') {
                // For Assigned status, look for any record with a non-null assignedStatus
                // OR where requestStatus is explicitly set to 'Assigned'
                query += ` AND (cr.assignedStatus IS NOT NULL 
                              OR cr.requestStatus = 'Assigned')`;
            } else if (status === 'Not Assigned') {
                // For Not Assigned, look for records with null assignedStatus
                // AND requestStatus specifically set to 'Not Assigned'
                query += ` AND (cr.assignedStatus IS NULL 
                              AND cr.requestStatus = 'Not Assigned')`;
            } else {
                // For any other specific status
                query += ` AND cr.requestStatus = ?`;
                queryParams.push(status);
            }
        }

        // Add assignedStatus filter if provided (specific assigned status like 'Collected', 'On way', etc.)
        if (requestStatus && requestStatus !== 'No requestStatus filter') {
            query += ` AND cr.assignedStatus = ?`;
            queryParams.push(requestStatus);
        }

        // Add ORDER BY to sort results
        query += ` ORDER BY cr.createdAt DESC`;

        console.log('Executing Query:', query);
        console.log('Query Params:', queryParams);

        db.plantcare.query(query, queryParams, (error, results) => {
            if (error) {
                console.error('Database Query Error:', error);
                return reject(error);
            }

            if (!results || results.length === 0) {
                return resolve([]);
            }

            // Get all request IDs to fetch their items
            const requestIds = results.map(result => result.id);

            // Query to get all items for these requests
            const itemsQuery = `
                SELECT * 
                FROM collection_officer.collectionrequestitems 
                WHERE requestId IN (?)
            `;

            db.plantcare.query(itemsQuery, [requestIds], (itemsError, itemsResults) => {
                if (itemsError) {
                    console.error('Database Items Query Error:', itemsError);
                    return reject(itemsError);
                }

                // Group items by requestId
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

                // Transform results to match frontend expectations
                const transformedResults = results.map(result => ({
                    id: result.id,
                    name: result.firstName || `Farmer ${result.farmerId}`,
                    route: result.farmerRoute || `Route ${result.farmerId}`,
                    nic: result.NICnumber || `NIC ${result.NICnumber}`,
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
};

// exports.getViewDetailsById = (requestId) => {
//     return new Promise((resolve, reject) => {
//         // Query to fetch the collection request and related farmer details
//         const query = `
//             SELECT 
//                 cr.id, 
//                 cr.farmerId, 
//                 f.firstName AS firstName,
//                 f.NICnumber As NICnumber,
//                 f.route AS farmerRoute,
//                 f.city AS city,
//                 f.streetName AS streetName,
//                 f.houseNo AS houseNo,
//                 cr.centerId, 
//                 cr.companyId, 
//                 cr.scheduleDate,
//                 cr.createdAt, 
//                 cr.requestStatus, 
//                 cr.assignedStatus
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

//             // Get all items for this request
//             const itemsQuery = `
//                 SELECT *
//                 FROM collection_officer.collectionrequestitems 
//                 WHERE requestId = ?
//             `;

//             db.plantcare.query(itemsQuery, [requestId], (itemsError, itemsResults) => {
//                 if (itemsError) {
//                     console.error('Database Items Query Error:', itemsError);
//                     return reject(itemsError);
//                 }

//                 // Format the response with items
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
//                     items: itemsResults.map(item => ({
//                         itemId: item.id,
//                         cropId: item.cropId,
//                         varietyId: item.varietyId,
//                         loadWeight: item.loadWeight
//                     }))
//                 };

//                 resolve(formattedResponse);
//             });
//         });
//     });
// };

exports.getViewDetailsById = (requestId) => {
    return new Promise((resolve, reject) => {
        // Query to fetch the collection request and related farmer details 
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
                cr.assignedStatus ,
                cr.requestId AS reqId
            FROM collection_officer.collectionrequest cr 
            LEFT JOIN plant_care.users f ON cr.farmerId = f.id 
            WHERE cr.id = ? 
        `;

        db.plantcare.query(query, [requestId], (error, results) => {
            if (error) {
                console.error('Database Query Error:', error);
                return reject(error);
            }

            if (!results || results.length === 0) {
                return resolve(null);
            }

            // Get all items for this request and join cropgroup and cropvariety to fetch names
            const itemsQuery = ` 
                SELECT 
                    ri.id, 
                    ri.cropId, 
                    ri.varietyId, 
                    ri.loadWeight, 
                    cg.cropNameEnglish, 
                    cv.varietyNameEnglish 
                FROM collection_officer.collectionrequestitems ri
                LEFT JOIN plant_care.cropgroup cg ON ri.cropId = cg.id
                LEFT JOIN plant_care.cropvariety cv ON ri.varietyId = cv.id
                WHERE ri.requestId = ? 
            `;

            db.plantcare.query(itemsQuery, [requestId], (itemsError, itemsResults) => {
                if (itemsError) {
                    console.error('Database Items Query Error:', itemsError);
                    return reject(itemsError);
                }

                // Format the response with items and the additional fields for crop and variety names
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
                    requestID : requestDetails.reqId,
                    items: itemsResults.map(item => ({
                        itemId: item.id,
                        cropId: item.cropId,
                        cropName: item.cropNameEnglish, // Adding cropNameEnglish from cropgroup
                        varietyId: item.varietyId,
                        varietyName: item.varietyNameEnglish, // Adding varietyNameEnglish from cropvariety
                        loadWeight: item.loadWeight
                    }))
                };

                resolve(formattedResponse);
                console.log('Formatted Response:', formattedResponse);
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
