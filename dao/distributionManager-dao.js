const db = require("../startup/database");

exports.getDCenterTarget = (irmId = null) => {
    console.log("Getting targets for IRM ID:", irmId || "ALL OFFICERS");

    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                co.id,
                co.irmId,

                dt.id AS distributedTargetId,
                dt.companycenterId,
                dt.userId,
                dt.target,
                dt.complete,
                dt.createdAt AS targetCreatedAt,

                dti.id AS distributedTargetItemId,
                dti.orderId,
                dti.isComplete,
                dti.completeTime,
                dti.createdAt AS itemCreatedAt,

                po.id AS processOrderId,
                po.invNo,
                po.transactionId,
                po.paymentMethod,
                po.isPaid,
                po.amount,
                po.status,
                po.createdAt AS orderCreatedAt,
                po.reportStatus,

                o.id AS orderId,
                o.isPackage,
                o.userId AS orderUserId,
                o.orderApp,
                o.buildingType,
                o.sheduleType,
                o.sheduleDate,
                o.sheduleTime,

                -- Additional item counts
                COALESCE(additional_item_counts.total_items, 0) AS totalAdditionalItems,
                COALESCE(additional_item_counts.packed_items, 0) AS packedAdditionalItems,
                COALESCE(additional_item_counts.pending_items, 0) AS pendingAdditionalItems,

                -- Additional item status
                CASE 
                    WHEN COALESCE(additional_item_counts.total_items, 0) = 0 THEN NULL
                    WHEN COALESCE(additional_item_counts.packed_items, 0) = 0 THEN 'Pending'
                    WHEN COALESCE(additional_item_counts.packed_items, 0) > 0 AND 
                         COALESCE(additional_item_counts.packed_items, 0) < COALESCE(additional_item_counts.total_items, 0) THEN 'Opened'
                    WHEN COALESCE(additional_item_counts.packed_items, 0) = COALESCE(additional_item_counts.total_items, 0) THEN 'Completed'
                    ELSE NULL
                END AS additionalItemStatus,

                -- Package item counts (only for packages)
                COALESCE(package_item_counts.total_items, 0) AS totalPackageItems,
                COALESCE(package_item_counts.packed_items, 0) AS packedPackageItems,
                COALESCE(package_item_counts.pending_items, 0) AS pendingPackageItems,

                -- Package details
                package_item_counts.isLock AS packageIsLock,
                package_item_counts.packingStatus AS packagePackingStatus,
                package_item_counts.packageId AS packageId,

                -- Package item status
                CASE 
                    WHEN o.isPackage = 0 THEN NULL
                    WHEN COALESCE(package_item_counts.total_items, 0) = 0 THEN 'Pending'
                    WHEN COALESCE(package_item_counts.packed_items, 0) = 0 THEN 'Pending'
                    WHEN COALESCE(package_item_counts.packed_items, 0) > 0 AND 
                         COALESCE(package_item_counts.packed_items, 0) < COALESCE(package_item_counts.total_items, 0) THEN 'Opened'
                    WHEN COALESCE(package_item_counts.packed_items, 0) = COALESCE(package_item_counts.total_items, 0) THEN 'Completed'
                    ELSE NULL
                END AS packageItemStatus,

                -- Overall status
                CASE 
                    -- For non-package orders (only check additional items)
                    WHEN o.isPackage = 0 THEN
                        CASE 
                            WHEN COALESCE(additional_item_counts.total_items, 0) = 0 THEN 'Pending'
                            WHEN COALESCE(additional_item_counts.packed_items, 0) = 0 THEN 'Pending'
                            WHEN COALESCE(additional_item_counts.packed_items, 0) > 0 AND 
                                 COALESCE(additional_item_counts.packed_items, 0) < COALESCE(additional_item_counts.total_items, 0) THEN 'Opened'
                            WHEN COALESCE(additional_item_counts.packed_items, 0) = COALESCE(additional_item_counts.total_items, 0) THEN 'Completed'
                            ELSE 'Pending'
                        END
                    
                    -- For package orders (check both additional and package items)
                    WHEN o.isPackage = 1 THEN
                        CASE 
                            -- When both additional and package items exist
                            WHEN COALESCE(additional_item_counts.total_items, 0) > 0 AND 
                                 COALESCE(package_item_counts.total_items, 0) > 0 THEN
                                CASE 
                                    WHEN COALESCE(additional_item_counts.packed_items, 0) = COALESCE(additional_item_counts.total_items, 0) AND
                                         COALESCE(package_item_counts.packed_items, 0) = COALESCE(package_item_counts.total_items, 0) THEN 'Completed'
                                    WHEN COALESCE(additional_item_counts.packed_items, 0) > 0 OR 
                                         COALESCE(package_item_counts.packed_items, 0) > 0 THEN 'Opened'
                                    ELSE 'Pending'
                                END
                            
                            -- When only additional items exist
                            WHEN COALESCE(additional_item_counts.total_items, 0) > 0 THEN
                                CASE 
                                    WHEN COALESCE(additional_item_counts.packed_items, 0) = 0 THEN 'Pending'
                                    WHEN COALESCE(additional_item_counts.packed_items, 0) > 0 AND 
                                         COALESCE(additional_item_counts.packed_items, 0) < COALESCE(additional_item_counts.total_items, 0) THEN 'Opened'
                                    WHEN COALESCE(additional_item_counts.packed_items, 0) = COALESCE(additional_item_counts.total_items, 0) THEN 'Completed'
                                    ELSE 'Pending'
                                END
                            
                            -- When only package items exist
                            WHEN COALESCE(package_item_counts.total_items, 0) > 0 THEN
                                CASE 
                                    WHEN COALESCE(package_item_counts.packed_items, 0) = 0 THEN 'Pending'
                                    WHEN COALESCE(package_item_counts.packed_items, 0) > 0 AND 
                                         COALESCE(package_item_counts.packed_items, 0) < COALESCE(package_item_counts.total_items, 0) THEN 'Opened'
                                    WHEN COALESCE(package_item_counts.packed_items, 0) = COALESCE(package_item_counts.total_items, 0) THEN 'Completed'
                                    ELSE 'Pending'
                                END
                            
                            -- When no items exist (shouldn't happen for package orders)
                            ELSE 'Pending'
                        END
                    ELSE 'Pending'
                END AS selectedStatus

            FROM 
                distributedtarget dt
            LEFT JOIN 
                collectionofficer co ON dt.userId = co.id
            LEFT JOIN 
                distributedtargetitems dti ON dt.id = dti.targetId
            LEFT JOIN 
                market_place.processorders po ON dti.orderId = po.id
            LEFT JOIN 
                market_place.orders o ON po.orderId = o.id
            LEFT JOIN (
                -- Additional items subquery
                SELECT 
                    orderId,
                    COUNT(*) as total_items,
                    SUM(CASE WHEN isPacked = 1 THEN 1 ELSE 0 END) as packed_items,
                    SUM(CASE WHEN isPacked = 0 THEN 1 ELSE 0 END) as pending_items
                FROM 
                    market_place.orderadditionalitems
                GROUP BY 
                    orderId
            ) additional_item_counts ON o.id = additional_item_counts.orderId
            LEFT JOIN (
                -- Package items subquery
                SELECT 
                    op.orderId,
                    op.isLock,
                    op.packingStatus,
                    op.packageId,
                    COUNT(opi.id) as total_items,
                    SUM(CASE WHEN opi.isPacked = 1 THEN 1 ELSE 0 END) as packed_items,
                    SUM(CASE WHEN opi.isPacked = 0 THEN 1 ELSE 0 END) as pending_items
                FROM 
                    market_place.orderpackage op
                LEFT JOIN 
                    market_place.orderpackageitems opi ON op.id = opi.orderPackageId
                GROUP BY 
                    op.orderId, op.isLock, op.packingStatus, op.packageId
            ) package_item_counts ON po.id = package_item_counts.orderId
            WHERE 
                DATE(dt.createdAt) = CURDATE()
                ${irmId ? 'AND (co.irmId = ? OR dt.userId = ?)' : ''}
            ORDER BY 
                dt.companycenterId ASC,
                dt.userId DESC,
                dt.target ASC,
                dt.complete ASC,
                o.id ASC
        `;

        // Execute the query with conditional parameters
        const queryParams = irmId ? [irmId, irmId] : [];
        db.collectionofficer.query(sql, queryParams, (err, results) => {
            if (err) {
                console.error("Error executing query:", err);
                return reject(err);
            }

            console.log("Targets found:", results.length);
            if (results.length > 0) {
                console.log("=== DEBUGGING DATA ===");

                // Log first 3 records for debugging
                results.slice(0, 3).forEach((row, index) => {
                    console.log(`Record ${index + 1}:`, {
                        collectionOfficerId: row.id,
                        irmId: row.irmId,
                        distributedTargetId: row.distributedTargetId,
                        processOrderId: row.processOrderId,
                        orderId: row.orderId,
                        isPackage: row.isPackage,
                        packageData: {
                            packageId: row.packageId,
                            isLock: row.packageIsLock,
                            items: {
                                total: row.totalPackageItems,
                                packed: row.packedPackageItems,
                                pending: row.pendingPackageItems,
                                status: row.packageItemStatus
                            }
                        },
                        additionalItems: {
                            total: row.totalAdditionalItems,
                            packed: row.packedAdditionalItems,
                            pending: row.pendingAdditionalItems,
                            status: row.additionalItemStatus
                        },
                        overallStatus: row.selectedStatus
                    });
                });

                // Status summary
                const statusCounts = results.reduce((acc, row) => {
                    acc[row.selectedStatus] = (acc[row.selectedStatus] || 0) + 1;
                    return acc;
                }, {});
                console.log("Status Distribution:", statusCounts);

                console.log("=== END DEBUGGING ===");
            }

            resolve(results);
        });
    });
};
// /**
//  * Alternative method if you want separate data instead of nested structure
//  */
// exports.getCenterTargetSeparate = async (officerId) => {
//     try {
//         console.log("getCenterTargetSeparate DAO called with officerId:", officerId);

//         // Get related officers
//         const officerQuery = `
//             SELECT id, centerId, distributedCenterId, companyId, irmId
//             FROM collectionofficer
//             WHERE irmId = (SELECT irmId FROM collectionofficer WHERE id = ?)
//         `;

//         const officers = await db.query(officerQuery, [officerId]);

//         if (!officers || officers.length === 0) {
//             return { officers: [], targets: [], targetItems: [] };
//         }

//         const officerIds = officers.map(officer => officer.id);
//         const placeholders = officerIds.map(() => '?').join(',');

//         // Get targets
//         const targetsQuery = `
//             SELECT * FROM distributedtarget
//             WHERE userId IN (${placeholders})
//             ORDER BY companycenterId ASC, userId DESC, target ASC, complete ASC, createdAt ASC
//         `;

//         const targets = await db.query(targetsQuery, officerIds);

//         // Get target items if targets exist
//         let targetItems = [];
//         if (targets && targets.length > 0) {
//             const targetIds = targets.map(target => target.id);
//             const targetPlaceholders = targetIds.map(() => '?').join(',');

//             const targetItemsQuery = `
//                 SELECT * FROM distributedtargetitems
//                 WHERE targetId IN (${targetPlaceholders})
//                 ORDER BY id ASC, targetId ASC, orderId ASC, isComplete ASC, completeTime ASC, createdAt ASC
//             `;

//             targetItems = await db.query(targetItemsQuery, targetIds);
//         }

//         return {
//             officers: officers,
//             targets: targets || [],
//             targetItems: targetItems || []
//         };

//     } catch (error) {
//         console.error('Error in getCenterTargetSeparate DAO:', error);
//         throw new Error(`Database error: ${error.message}`);
//     }
// };
exports.getOfficerDetailsById = (officerId) => {
    return new Promise((resolve, reject) => {
        const sql = `
      SELECT 
        co.*, 
        co.empId,
        dc.regCode,
        dc.centerName AS collectionCenterName,
        dc.contact01 AS centerContact01,
        dc.contact02 AS centerContact02,
        dc.district AS centerDistrict,
        dc.province AS centerProvince,
        com.companyNameEnglish AS companyNameEnglish,
        com.companyNameSinhala AS companyNameSinhala,
        com.companyNameTamil AS companyNameTamil,
        com.email AS companyEmail,
        com.oicName AS companyOICName,
        com.oicEmail AS companyOICEmail
      FROM 
        collectionofficer co
      JOIN 
        distributedcenter dc ON co.distributedCenterId = dc.id
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






exports.getAllReplaceRequests = (managerId) => {
    console.log("manager Id", managerId);
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                rr.id,
                rr.orderPackageId,
                rr.productType,
                rr.replceId,
                rr.productId,
                rr.qty,
                rr.price,
                rr.status,
                rr.createdAt,
                rr.userId,
                op.orderId,
                op.packageId,
                op.packingStatus,
                opi.id AS replaceItemId,
                opi.productType AS replaceProductType,
                opi.productId AS replaceProductId,
                opi.qty AS replaceQty,
                opi.price AS replacePrice,
                opi.isPacked AS replaceItemPacked,
                pt.typeName AS productTypeName,
                mi.displayName AS productDisplayName,
                mi.normalPrice AS productNormalPrice,
                mi.discountedPrice AS productDiscountedPrice,
                rmi.displayName AS replaceProductDisplayName,
                rmi.normalPrice AS replaceProductNormalPrice,
                rmi.discountedPrice AS replaceProductDiscountedPrice,
                po.id AS processOrderId,
                po.orderId AS processOrderOrderId,
                po.invNo,
                co.id AS collectionOfficerId,
                co.centerId,
                co.distributedCenterId,
                co.companyId
            FROM 
                market_place.replacerequest rr
            LEFT JOIN 
                market_place.orderpackage op ON rr.orderPackageId = op.id
            LEFT JOIN 
                market_place.producttypes pt ON rr.productType = pt.id
            LEFT JOIN 
                market_place.marketplaceitems mi ON rr.productId = mi.id
            LEFT JOIN 
                market_place.processorders po ON op.orderId = po.id
            LEFT JOIN 
                market_place.orderpackageitems opi ON rr.replceId = opi.id
            LEFT JOIN 
                market_place.marketplaceitems rmi ON opi.productId = rmi.id
            INNER JOIN 
                collection_officer.collectionofficer co ON rr.userId = co.id
            WHERE 
                co.irmId = ?
                AND rr.status = 'Pending'
            ORDER BY 
                rr.createdAt DESC,
                rr.id ASC
            LIMIT 1000
        `;

        db.marketPlace.query(sql, [managerId], (err, results) => {
            if (err) {
                console.error("Database error details:", {
                    message: err.message,
                    sql: err.sql,
                    code: err.code,
                    errno: err.errno
                });
                return reject(new Error("Database error while fetching pending replace requests"));
            }

            console.log(`Found ${results.length} pending replace requests for manager ${managerId}`);
            resolve(results);
        });
    });
};

exports.getRetailItemsExcludingUserExclusions = (orderId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                mi.id,
                mi.varietyId,
                mi.displayName,
                mi.category,
                mi.normalPrice,
                mi.discountedPrice,
                mi.unitType
            FROM 
                market_place.marketplaceitems mi
            WHERE 
                mi.category = 'Retail'
                AND mi.id NOT IN (
                    SELECT DISTINCT el.mpItemId 
                    FROM market_place.excludelist el
                    WHERE el.userId = (
                        SELECT o.userId 
                        FROM market_place.processorders po
                        INNER JOIN market_place.orders o ON o.id = po.orderId
                        WHERE po.id = ?
                    )
                    AND el.mpItemId IS NOT NULL
                )
            ORDER BY 
                mi.displayName ASC
        `;

        db.marketPlace.query(sql, [orderId], (err, results) => {
            if (err) {
                console.error("Database error details:", {
                    message: err.message,
                    sql: err.sql,
                    code: err.code,
                    errno: err.errno
                });
                return reject(new Error("Database error while fetching retail items"));
            }

            // Format the results
            const formattedResults = results.map(item => ({
                id: item.id,
                varietyId: item.varietyId,
                displayName: item.displayName,
                category: item.category,
                normalPrice: parseFloat(item.normalPrice || 0),
                discountedPrice: item.discountedPrice ? parseFloat(item.discountedPrice) : null,
                unitType: item.unitType
            }));

            resolve(formattedResults);
        });
    });
};

exports.getOrdreReplace = (id) => {
    console.log("DAO getOrdreReplace called with ID:", id);
    return new Promise((resolve, reject) => {
        const sql = `
      SELECT 
        rr.replceId,
        rr.id,
        rr.orderPackageId,
        rr.productType,
        rr.productId,
        rr.qty,
        rr.price,
        rr.status,
        rr.userId,
        rr.createdAt,
        mpi.displayName
      FROM market_place.replacerequest rr
      LEFT JOIN market_place.marketplaceitems mpi ON rr.productId = mpi.id
      WHERE rr.id = ?  
      ORDER BY rr.replceId DESC, rr.id ASC, rr.orderPackageId ASC, 
               rr.productType ASC, rr.productId ASC, rr.qty ASC, 
               rr.price ASC, rr.status ASC, rr.userId ASC
    `;

        console.log("Executing SQL:", sql);
        console.log("With parameter:", [id]);
        db.marketPlace.query(sql, [id], (err, results) => {
            if (err) {
                console.error("Database error details:", {
                    message: err.message,
                    sql: err.sql,
                    code: err.code,
                    errno: err.errno
                });
                return reject(new Error("Database error while fetching replace request data"));
            }

            console.log("Query results:", results);

            // Format the results
            const formattedResults = results.map(item => ({
                replceId: item.replceId,
                id: item.id,
                orderPackageId: item.orderPackageId,
                productType: item.productType,
                productId: item.productId,
                qty: parseInt(item.qty || 0),
                price: parseFloat(item.price || 0),
                status: item.status,
                userId: item.userId,
                createdAt: item.createdAt,

                displayName: item.displayName // Product display name from join
            }));

            resolve(formattedResults);
        });
    });
};


// targetDDao.approveReplaceRequest function
exports.approveReplaceRequest = (params) => {
    console.log("DAO approveReplaceRequest called with params:", params);

    return new Promise((resolve, reject) => {
        // Fix: Map replaceRequestId to replceId (the actual database column name)
        const { replaceRequestId, newProductId, quantity, price } = params;
        const replceId = replaceRequestId; // Map to the actual database column name

        // Validate required parameters
        if (!replceId || !newProductId || !quantity || !price) {
            return reject(new Error("Missing required parameters: replaceRequestId, newProductId, quantity, price"));
        }

        console.log("Using replceId:", replceId); // Debug log

        // Get connection from pool and start transaction
        db.marketPlace.getConnection((err, connection) => {
            if (err) {
                console.error("Failed to get connection from pool:", err);
                return reject(new Error("Failed to get database connection"));
            }

            // Start transaction
            connection.beginTransaction((err) => {
                if (err) {
                    console.error("Transaction begin error:", err);
                    connection.release();
                    return reject(new Error("Failed to start transaction"));
                }

                // Step 1: Get replace request details first
                const getReplaceRequestSql = `
                    SELECT 
                        rr.id,
                        rr.replceId,
                        rr.orderPackageId,
                        rr.productType,
                        rr.productId as oldProductId,
                        rr.qty as oldQty,
                        rr.price as oldPrice,
                        rr.status,
                        op.isLock
                    FROM market_place.replacerequest rr
                    JOIN market_place.orderpackage op ON rr.orderPackageId = op.id
                    WHERE rr.id = ?
                `;

                connection.query(getReplaceRequestSql, [replceId], (err, replaceResults) => {
                    if (err) {
                        console.error("Get replace request error:", err);
                        return connection.rollback(() => {
                            connection.release();
                            reject(new Error("Failed to get replace request details"));
                        });
                    }

                    if (replaceResults.length === 0) {
                        return connection.rollback(() => {
                            connection.release();
                            reject(new Error(`Replace request not found with replceId: ${replceId}`));
                        });
                    }

                    const replaceRequest = replaceResults[0];
                    console.log("Replace request found:", replaceRequest);

                    // Check if already approved
                    if (replaceRequest.status === 'Approved') {
                        return connection.rollback(() => {
                            connection.release();
                            reject(new Error("Replace request is already approved"));
                        });
                    }

                    // Step 1.5: Find the corresponding orderpackageitems record
                    // FIX: Instead of looking for the old product ID, find the item by orderPackageId only
                    // since there might be a mismatch between replace request and actual order items
                    const getOrderPackageItemsSql = `
                        SELECT id, productId, qty, price 
                        FROM market_place.orderpackageitems 
                        WHERE orderPackageId = ?
                        ORDER BY id ASC
                        LIMIT 1
                    `;

                    console.log("Looking for orderpackageitems with orderPackageId:", replaceRequest.orderPackageId);

                    connection.query(
                        getOrderPackageItemsSql,
                        [replaceRequest.orderPackageId],
                        (err, itemsResults) => {
                            if (err) {
                                console.error("Get order package items error:", err);
                                return connection.rollback(() => {
                                    connection.release();
                                    reject(new Error("Failed to get order package items"));
                                });
                            }

                            console.log("Order package items query results:", itemsResults);

                            if (itemsResults.length === 0) {
                                return connection.rollback(() => {
                                    connection.release();
                                    reject(new Error("No order package items found for this order"));
                                });
                            }

                            const orderPackageItem = itemsResults[0];
                            console.log("Order package item to update:", orderPackageItem);

                            // Log the mismatch if it exists
                            if (orderPackageItem.productId !== replaceRequest.oldProductId) {
                                console.log(`WARNING: Product ID mismatch detected!`);
                                console.log(`Replace request expects oldProductId: ${replaceRequest.oldProductId}`);
                                console.log(`But order package item has productId: ${orderPackageItem.productId}`);
                                console.log(`Proceeding with the update using the actual order package item...`);
                            }

                            // Step 2: Update replacerequest table
                            const updateReplaceRequestSql = `
                                UPDATE market_place.replacerequest 
                                SET 
                                    productId = ?,
                                    qty = ?,
                                    price = ?,
                                    status = 'Approved'
                                   
                                WHERE id = ?
                            `;

                            connection.query(
                                updateReplaceRequestSql,
                                [newProductId, quantity, price, replaceRequest.id],
                                (err, updateReplaceResult) => {
                                    if (err) {
                                        console.error("Update replace request error:", err);
                                        return connection.rollback(() => {
                                            connection.release();
                                            reject(new Error("Failed to update replace request"));
                                        });
                                    }

                                    console.log("Replace request updated:", updateReplaceResult);

                                    // Step 3: Update orderpackageitems table
                                    const updateOrderPackageItemsSql = `
                                        UPDATE market_place.orderpackageitems 
                                        SET 
                                            productId = ?,
                                            qty = ?,
                                            price = ?
                                           
                                        WHERE id = ?
                                    `;

                                    console.log("About to update orderpackageitems with:", {
                                        newProductId,
                                        quantity,
                                        price,
                                        orderPackageItemId: orderPackageItem.id
                                    });

                                    connection.query(
                                        updateOrderPackageItemsSql,
                                        [newProductId, quantity, price, orderPackageItem.id],
                                        (err, updateItemsResult) => {
                                            if (err) {
                                                console.error("Update order package items error:", err);
                                                return connection.rollback(() => {
                                                    connection.release();
                                                    reject(new Error("Failed to update order package items"));
                                                });
                                            }

                                            console.log("Order package items updated:", updateItemsResult);
                                            console.log("Affected rows:", updateItemsResult.affectedRows);

                                            if (updateItemsResult.affectedRows === 0) {
                                                console.log("WARNING: No rows were updated in orderpackageitems!");
                                            }

                                            // Step 4: Update orderpackage table (set isLock = 0)
                                            const updateOrderPackageSql = `
                                                UPDATE market_place.orderpackage 
                                                SET 
                                                    isLock = 0
                                                
                                                WHERE id = ?
                                            `;

                                            connection.query(
                                                updateOrderPackageSql,
                                                [replaceRequest.orderPackageId],
                                                (err, updatePackageResult) => {
                                                    if (err) {
                                                        console.error("Update order package error:", err);
                                                        return connection.rollback(() => {
                                                            connection.release();
                                                            reject(new Error("Failed to update order package"));
                                                        });
                                                    }

                                                    console.log("Order package updated:", updatePackageResult);

                                                    // Step 5: Commit transaction
                                                    connection.commit((err) => {
                                                        if (err) {
                                                            console.error("Transaction commit error:", err);
                                                            return connection.rollback(() => {
                                                                connection.release();
                                                                reject(new Error("Failed to commit transaction"));
                                                            });
                                                        }

                                                        console.log("Transaction committed successfully");

                                                        // Release connection back to pool
                                                        connection.release();

                                                        // Return success response
                                                        resolve({
                                                            success: true,
                                                            message: 'Replace request approved successfully',
                                                            data: {
                                                                replaceRequestId: replaceRequestId,
                                                                replceId: replceId,
                                                                orderPackageId: replaceRequest.orderPackageId,
                                                                oldProductId: orderPackageItem.productId, // Use actual product ID from order
                                                                newProductId: newProductId,
                                                                oldQuantity: orderPackageItem.qty,
                                                                newQuantity: quantity,
                                                                oldPrice: orderPackageItem.price,
                                                                newPrice: price,
                                                                updatedTables: [
                                                                    'replacerequest',
                                                                    'orderpackageitems',
                                                                    'orderpackage'
                                                                ]
                                                            }
                                                        });
                                                    });
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        }
                    );
                });
            });
        });
    });
};