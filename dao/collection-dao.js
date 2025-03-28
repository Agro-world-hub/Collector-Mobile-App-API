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

exports.getAllCollectionRequest = (status, assignedStatus) => {
    return new Promise((resolve, reject) => {
        // Enhanced query to join farmer details
        let query = `
            SELECT 
                cr.id, 
                cr.farmerId, 
                f.firstName AS firstName,
                f.route AS farmerRoute,
                cr.centerId, 
                cr.companyId, 
                cr.cropId, 
                cr.varietyId, 
                cr.loadWeight, 
                cr.createdAt, 
                cr.requestStatus, 
                cr.assignedStatus 
            FROM collectionrequest cr
            LEFT JOIN plant_care.users f ON cr.farmerId = f.id
            WHERE 1=1
        `;

        const queryParams = [];

        // Add date filter to get only today's requests
        query += ` AND DATE(cr.createdAt) = CURDATE()`;

        // Add status filter if provided
        if (status) {
            query += ` AND cr.requestStatus = ?`;
            queryParams.push(status);
        }

        // Add assignedStatus filter if provided
        if (assignedStatus) {
            query += ` AND cr.assignedStatus = ?`;
            queryParams.push(assignedStatus);
        }

        // Add ORDER BY to sort results
        query += ` ORDER BY cr.createdAt DESC`;

        console.log('Executing Query:', query);
        console.log('Query Params:', queryParams);

        db.collectionofficer.query(query, queryParams, (error, results) => {
            if (error) {
                console.error('Database Query Error:', error);
                return reject(error);
            }

            // Transform results to match frontend expectations
            const transformedResults = results.map(result => ({
                id: result.id,
                name: result.firstName || `Farmer ${result.farmerId}`,
                route: result.farmerRoute || `Route ${result.farmerId}`,
                farmerId: result.farmerId,
                cropId: result.cropId,
                requestStatus: result.requestStatus,
                assignedStatus: result.assignedStatus
            }));

            console.log('Transformed Query Results:', transformedResults);
            resolve(transformedResults);
        });
    });
};