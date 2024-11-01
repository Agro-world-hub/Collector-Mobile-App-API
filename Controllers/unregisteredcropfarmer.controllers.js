const jwt = require('jsonwebtoken');
const db = require('../startup/database');

// Controller to add crop details as payment records
const addCropDetails = (req, res) => {
    const { farmerId, crops } = req.body;
    const collectionOfficerId = req.user.id;
    console.log(crops);
    console.log(farmerId) // Get collection officer ID from req.user

    // Check that crops array is provided and contains items
    if (!Array.isArray(crops) || crops.length === 0) {
        return res.status(400).json({ error: 'Crops data is required and must be an array' });
    }

    // Insert each crop record
    let insertCount = 0; // To track how many records have been inserted
    const totalCrops = crops.length;

    crops.forEach(crop => {
        const { cropName, variety, unitPriceA, weightA, unitPriceB, weightB, unitPriceC, weightC, total, image } = crop;

        const query = `
            INSERT INTO registeredfarmerpayments 
            (userId, collectionOfficerId, cropName, unitPriceA, weightA, total, image, variety, unitPriceB, weightB, unitPriceC, weightC) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            farmerId,
            collectionOfficerId,
            cropName,
            unitPriceA, // Ensure this matches the unit price for grade A
            weightA, // Ensure this matches the weight for grade A
            total,
            image ? Buffer.from(image, 'base64') : null, // Convert image if in base64
            variety, // Include the variety
            unitPriceB, // Include unit price for grade B
            weightB, // Include weight for grade B
            unitPriceC, // Include unit price for grade C
            weightC, // Include weight for grade C
        ];

        db.query(query, values, (error, results) => {
            if (error) {
                console.error('Error inserting crop record:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            insertCount++;

            // After all records are inserted
            if (insertCount === totalCrops) {
                res.status(201).json({ message: 'Crop payment records added successfully' });
            }
        });
    });
};

// controller that fetches crop details registered for the current date
const getTodayCropDetailsByUserId = (req, res) => {
    const { userId } = req.params; // Get userId from request parameters

    // Get the current date in 'YYYY-MM-DD' format
    const today = new Date().toISOString().split('T')[0];

    const query = `
        SELECT id, cropName, variety, unitPriceA, weightA, unitPriceB, weightB, unitPriceC, weightC, total
        FROM registeredfarmerpayments
        WHERE userId = ? AND DATE(createdAt) = ?
    `;

    db.query(query, [userId, today], (error, results) => {
        if (error) {
            console.error('Error fetching crop details:', error);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(200).json(results);
    });
};


// Controller to fetch all crop names
const getAllCropNames = (req, res) => {
    const query = 'SELECT id, cropName FROM cropcalender';

    db.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(200).json(results);
    });
};

// Controller to fetch varieties based on selected crop name
const getVarietiesByCropName = (req, res) => {
    const { cropName } = req.params;

    const query = 'SELECT id, variety FROM cropcalender WHERE cropName = ?';

    db.query(query, [cropName], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(200).json(results);
    });
};

// Controller to fetch unit prices by crop ID
const getUnitPricesByCropId = (req, res) => {
    const { cropId } = req.params;

    const query = `
        SELECT grade, price
        FROM marketprice
        WHERE cropId = ?
    `;

    db.query(query, [cropId], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(200).json(results);
    });
};

module.exports = {
    addCropDetails,
    getAllCropNames,
    getVarietiesByCropName,
    getUnitPricesByCropId,
    getTodayCropDetailsByUserId
};