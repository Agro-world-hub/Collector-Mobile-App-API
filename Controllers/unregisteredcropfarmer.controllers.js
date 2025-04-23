const jwt = require('jsonwebtoken');
const db = require('../startup/database');

const addCropDetails = (req, res) => {
    const { crops } = req.body;
    const userId = req.user.id;
    const farmerId = req.body.farmerId;

    console.log(farmerId);
    console.log(crops);

    if (!Array.isArray(crops) || crops.length === 0) {
        return res.status(400).json({ error: 'Crops data is required and must be an array' });
    }

    // Start a transaction
    db.beginTransaction(err => {
        if (err) {
            console.error('Transaction start failed:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const paymentQuery = `
            INSERT INTO registeredfarmerpayments (userId, collectionOfficerId) 
            VALUES (?, ?)
        `;
        const paymentValues = [farmerId, userId];

        db.query(paymentQuery, paymentValues, (paymentErr, paymentResult) => {
            if (paymentErr) {
                console.error('Error inserting registered farmer payment:', paymentErr);
                return db.rollback(() => {
                    res.status(500).json({ error: 'Failed to insert registered farmer payment' });
                });
            }

            const registeredFarmerId = paymentResult.insertId; // Get the inserted farmer payment ID

            // Insert crop records into `farmerpaymentscrops`
            const cropQueries = crops.map(crop => {
                const {
                    varietyId, // Only use varietyId for inserting
                    gradeAprice,
                    gradeBprice,
                    gradeCprice,
                    gradeAquan,
                    gradeBquan,
                    gradeCquan,
                    image // Include the image from crop
                } = crop;

                const cropQuery = `
                    INSERT INTO farmerpaymentscrops (
                        registerFarmerId, cropId, gradeAprice, gradeBprice, gradeCprice, 
                        gradeAquan, gradeBquan, gradeCquan, image
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                const cropValues = [
                    registeredFarmerId,
                    varietyId, // Insert only the varietyId here
                    gradeAprice || 0,
                    gradeBprice || 0,
                    gradeCprice || 0,
                    gradeAquan || 0,
                    gradeBquan || 0,
                    gradeCquan || 0,
                    image ? Buffer.from(image, 'base64') : null // Convert base64 to binary
                ];

                return new Promise((resolve, reject) => {
                    db.query(cropQuery, cropValues, (cropErr, cropResult) => {
                        if (cropErr) {
                            return reject(cropErr);
                        }
                        resolve(cropResult);
                    });
                });
            });

            // Execute all crop queries
            Promise.all(cropQueries)
                .then(() => {
                    db.commit(commitErr => {
                        if (commitErr) {
                            console.error('Transaction commit failed:', commitErr);
                            return db.rollback(() => {
                                res.status(500).json({ error: 'Transaction commit failed' });
                            });
                        }

                        res.status(201).json({
                            message: 'Crop payment records added successfully',
                            registeredFarmerId
                        });
                    });
                })
                .catch(cropInsertErr => {
                    console.error('Error inserting crop records:', cropInsertErr);
                    db.rollback(() => {
                        res.status(500).json({ error: 'Failed to insert crop records' });
                    });
                });
        });
    });
};




// controller that fetches crop details registered for the current date
const getCropDetailsByUserId = (req, res) => {
    const { userId } = req.params; // Extract userId from request parameters

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
             COALESCE(fpc.gradeCprice * fpc.gradeCquan, 0)) AS total
        FROM 
            farmerpaymentscrops fpc
        INNER JOIN 
            cropvariety cv ON fpc.cropId = cv.id
        INNER JOIN 
            cropgroup cg ON cv.cropGroupId = cg.id
        INNER JOIN 
            registeredfarmerpayments rfp ON fpc.registerFarmerId = rfp.id
        WHERE 
            rfp.userId = ?
        ORDER BY 
            fpc.createdAt DESC
    `;

    db.query(query, [userId], (error, results) => {
        if (error) {
            console.error('Error fetching crop details:', error);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(200).json(results);
    });
};




// Controller to fetch all crop names
const getAllCropNames = (req, res) => {
    const query = 'SELECT id, cropNameEnglish FROM cropgroup';

    db.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(200).json(results);
    });
};

// Controller to fetch varieties based on selected crop name
const getVarietiesByCropId = (req, res) => {
    console.log(req.params); // This will log all parameters
    const cropId = req.params.id;

    console.log(cropId); // Get crop ID from the request URL

    const query = 'SELECT id ,varietyNameEnglish FROM cropvariety WHERE cropGroupId = ?';
    db.query(query, [cropId], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }

        res.status(200).json(results);
    });
};


// Controller to fetch unit prices by crop ID
const getUnitPricesByCropId = (req, res) => {
    const { cropId } = req.params;
    console.log(cropId)
    // Extract cropId from the URL parameters

    console.log("Received cropId:", cropId); // Log to verify the cropId

    // SQL query to get the grades and prices for the given varietyId (cropId)
    const query = `
        SELECT grade, price
        FROM marketprice
        WHERE varietyId = ?  
    `;

    db.query(query, [cropId], (error, results) => {
        if (error) {
            console.error("Database error:", error);
            return res.status(500).json({ error: 'Database query failed' });
        }

        // Return the results in the response
        if (results.length === 0) {
            return res.status(404).json({ message: 'No market prices found for the specified cropId' });
        }

        res.status(200).json(results); // Respond with the market price details
    });
};


module.exports = {
    addCropDetails,
    getAllCropNames,
    getVarietiesByCropId,
    getUnitPricesByCropId,
    getCropDetailsByUserId
};