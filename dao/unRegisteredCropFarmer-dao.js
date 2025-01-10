const jwt = require("jsonwebtoken");
const db = require("../startup/database");

// Insert payment for a registered farmer
exports.insertFarmerPayment = (farmerId, userId) => {
    return new Promise((resolve, reject) => {
        const paymentQuery = `
            INSERT INTO registeredfarmerpayments (userId, collectionOfficerId) 
            VALUES (?, ?)
        `;
        const paymentValues = [farmerId, userId];

        db.collectionofficer.query(paymentQuery, paymentValues, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result.insertId); // Return the inserted farmer payment ID
        });
    });
};

// Insert crop details
exports.insertCropDetails = (registeredFarmerId, crop) => {
    return new Promise((resolve, reject) => {
        const {
            varietyId,
            gradeAprice,
            gradeBprice,
            gradeCprice,
            gradeAquan,
            gradeBquan,
            gradeCquan,
            image
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
            image ? Buffer.from(image, 'base64') : null
        ];

        db.collectionofficer.query(cropQuery, cropValues, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
};


exports.getCropDetailsByUserId = (userId) => {
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
                 COALESCE(fpc.gradeCprice * fpc.gradeCquan, 0)) AS total
            FROM 
                farmerpaymentscrops fpc
            INNER JOIN 
                \`plant-care\`.\`cropvariety\` cv ON fpc.cropId = cv.id
            INNER JOIN 
                \`plant-care\`.\`cropgroup\` cg ON cv.cropGroupId = cg.id
            INNER JOIN 
                registeredfarmerpayments rfp ON fpc.registerFarmerId = rfp.id
            WHERE 
                rfp.userId = ?
            ORDER BY 
                fpc.createdAt DESC
        `;

        db.collectionofficer.query(query, [userId], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
};


exports.getAllCropNames = () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT id, cropNameEnglish FROM cropgroup';
        
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
        const query = 'SELECT id, varietyNameEnglish FROM cropvariety WHERE cropGroupId = ?';
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