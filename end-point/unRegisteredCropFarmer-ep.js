
// const jwt = require("jsonwebtoken");
// const cropDetailsDao = require('../dao/unRegisteredCropFarmer-dao');
// const db = require('../startup/database');

// exports.addCropDetails = async (req, res) => {
//     console.log("Request body:", req.body);
//     const { crops, farmerId } = req.body;
//     const userId = req.user.id;

//     if (!Array.isArray(crops) || crops.length === 0) {
//         return res.status(400).json({ error: 'Crops data is required and must be an array' });
//     }

//     try {
//         // Start a transaction
//         await new Promise((resolve, reject) => db.beginTransaction(err => (err ? reject(err) : resolve())));

//         // Insert registered farmer payment
//         const registeredFarmerId = await cropDetailsDao.insertFarmerPayment(farmerId, userId);

//         // Insert crop details
//         const cropPromises = crops.map(crop => cropDetailsDao.insertCropDetails(registeredFarmerId, crop));
//         await Promise.all(cropPromises);

//         // Commit the transaction
//         await new Promise((resolve, reject) => db.commit(err => (err ? reject(err) : resolve())));

//         res.status(201).json({
//             message: 'Crop payment records added successfully',
//             registeredFarmerId
//         });
//     } catch (err) {
//         console.error('Error processing request:', err);
//         await new Promise((resolve) => db.rollback(() => resolve())); // Rollback transaction
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

// exports.addCropDetails2 = async (req, res) => {
//     console.log("Request body:", req.body.crops);
//     const { crops, farmerId } = req.body;
//     const userId = req.user.id;

//     if (!crops || typeof crops !== 'object') {
//         return res.status(400).json({ error: 'Crops data is required and must be an object' });
//     }

//     try {
//         const registeredFarmerId = await cropDetailsDao.insertFarmerPayment(farmerId, userId);
//         await cropDetailsDao.insertCropDetails(registeredFarmerId, crops);

//         res.status(201).json({
//             message: 'Crop payment records added successfully',
//             registeredFarmerId
//         });
//     } catch (err) {
//         console.error('Error processing request:', err);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };


// exports.getCropDetailsByUserId = async (req, res) => {
//     const { userId } = req.params;

//     try {
//         const cropDetails = await cropDetailsDao.getCropDetailsByUserId(userId);
//         res.status(200).json(cropDetails);
//     } catch (error) {
//         console.error('Error fetching crop details:', error);
//         res.status(500).json({ error: 'An error occurred while fetching crop details' });
//     }
// };

// exports.getAllCropNames = async (req, res) => {
//     try {
//         const cropNames = await cropDetailsDao.getAllCropNames();
//         res.status(200).json(cropNames);  // Sending the response as JSON
//     } catch (error) {
//         console.error('Error fetching crop names:', error);
//         res.status(500).json({ error: 'Failed to retrieve crop names' });
//     }
// };

// exports.getVarietiesByCropId = async (req, res) => {
//     const cropId = req.params.id;  // Extract cropId from request parameters

//     try {
//         const varieties = await cropDetailsDao.getVarietiesByCropId(cropId);
//         res.status(200).json(varieties);  // Return the varieties as JSON
//     } catch (error) {
//         console.error('Error fetching crop varieties:', error);  // Log the error for debugging
//         res.status(500).json({ error: 'Failed to retrieve crop varieties' });
//     }
// };

// exports.getUnitPricesByCropId = async (req, res) => {
//     const { cropId } = req.params; // Extract cropId from the URL parameters

//     try {
//         console.log("Received cropId:", cropId); // Log for debugging, consider replacing in production with a proper logger

//         // Fetch market prices by varietyId (cropId)
//         const prices = await cropDetailsDao.getMarketPricesByVarietyId(cropId);

//         if (prices.length === 0) {
//             return res.status(404).json({ message: 'No market prices found for the specified cropId' });
//         }

//         // Return the market prices as a JSON response
//         res.status(200).json(prices);
//     } catch (error) {
//         console.error("Error retrieving market prices:", error);  // Log the error
//         res.status(500).json({ error: 'Failed to retrieve market prices' });
//     }
// };

const jwt = require("jsonwebtoken");
const cropDetailsDao = require('../dao/unRegisteredCropFarmer-dao');
const db = require('../startup/database');
const { cropDetailsSchema } = require('../Validations/crop-validations');


exports.addCropDetails = async (req, res) => {
    console.log("Request body:", req.body);
    const { crops, farmerId , invoiceNumber } = req.body;
    console.log('invoiceNumber:', invoiceNumber);
    const userId = req.user.id;

    // Step 1: Validate the request body using Joi
    const { error } = cropDetailsSchema.validate(req.body);

    if (error) {
        // Log the full Joi error details for debugging
        console.error('Joi Validation Error:', error.details);

        // Send a detailed error response with the first validation error message
        return res.status(400).json({
            status: 'error',
            message: error.details[0].message,  // Send only the first error message
            details: error.details              // Optionally include all error details in the response
        });
    }

    try {
        // Step 2: Start a transaction
        await new Promise((resolve, reject) => db.collectionofficer.beginTransaction(err => (err ? reject(err) : resolve())));

        // Step 3: Insert registered farmer payment
        const registeredFarmerId = await cropDetailsDao.insertFarmerPayment(farmerId, userId ,invoiceNumber);

        // Step 4: Insert crop details
        const cropPromises = crops.map(crop => cropDetailsDao.insertCropDetails(registeredFarmerId, crop));
        await Promise.all(cropPromises);

        // Step 5: Commit the transaction
        await new Promise((resolve, reject) => db.collectionofficer.commit(err => (err ? reject(err) : resolve())));

        res.status(201).json({
            message: 'Crop payment records added successfully',
            registeredFarmerId
        });
    } catch (err) {
        console.error('Error processing request:', err);
        await new Promise((resolve) => db.rollback(() => resolve())); // Rollback transaction
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.addCropDetails2 = async (req, res) => {
    console.log("Request body:", req.body.crops);
    const { crops, farmerId,invoiceNumber } = req.body;
    console.log('invoiceNumber:', invoiceNumber);
    const userId = req.user.id;

    if (!crops || typeof crops !== 'object') {
        return res.status(400).json({ error: 'Crops data is required and must be an object' });
    }

    try {
        const registeredFarmerId = await cropDetailsDao.insertFarmerPayment(farmerId, userId ,invoiceNumber);
        await cropDetailsDao.insertCropDetails(registeredFarmerId, crops);

        res.status(201).json({
            message: 'Crop payment records added successfully',
            registeredFarmerId
        });
    } catch (err) {
        console.error('Error processing request:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.getCropDetailsByUserId= async (req, res) => {
    const { userId, registeredFarmerId } = req.params;

    try {
        const cropDetails = await cropDetailsDao.getCropDetailsByUserAndFarmerId(userId, registeredFarmerId);
        res.status(200).json(cropDetails);
    } catch (error) {
        console.error('Error fetching crop details:', error);
        res.status(500).json({ error: 'An error occurred while fetching crop details' });
    }
};

exports.getAllCropNames = async (req, res) => {
    try {
        const cropNames = await cropDetailsDao.getAllCropNames();
        res.status(200).json(cropNames);  // Sending the response as JSON
    } catch (error) {
        console.error('Error fetching crop names:', error);
        res.status(500).json({ error: 'Failed to retrieve crop names' });
    }
};

exports.getVarietiesByCropId = async (req, res) => {
    const cropId = req.params.id;  // Extract cropId from request parameters
    console.log(cropId);
    

    try {
        const varieties = await cropDetailsDao.getVarietiesByCropId(cropId);
        res.status(200).json(varieties);  // Return the varieties as JSON
    } catch (error) {
        console.error('Error fetching crop varieties:', error);  // Log the error for debugging
        res.status(500).json({ error: 'Failed to retrieve crop varieties' });
    }
};

exports.getUnitPricesByCropId = async (req, res) => {
    const { cropId } = req.params; // Extract cropId from the URL parameters

    try {
        console.log("Received cropId:", cropId); // Log for debugging, consider replacing in production with a proper logger

        // Fetch market prices by varietyId (cropId)
        const prices = await cropDetailsDao.getMarketPricesByVarietyId(cropId);

        if (prices.length === 0) {
            return res.status(404).json({ message: 'No market prices found for the specified cropId' });
        }

        // Return the market prices as a JSON response
        res.status(200).json(prices);
    } catch (error) {
        console.error("Error retrieving market prices:", error);  // Log the error
        res.status(500).json({ error: 'Failed to retrieve market prices' });
    }
};