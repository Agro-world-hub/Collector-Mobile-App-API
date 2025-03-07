
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
const {collectionofficer} = require('../startup/database');
const { cropDetailsSchema } = require('../Validations/crop-validations');
const s3middleware = require('../Middlewares/s3upload');


// exports.addCropDetails = async (req, res) => {
//     console.log("Request body:", req.body);
//     const { crops, farmerId, invoiceNumber } = req.body;
//     console.log('invoiceNumber:', invoiceNumber);
//     const userId = req.user.id;
  
//     // Step 1: Validate the request body using Joi
//     const { error } = cropDetailsSchema.validate(req.body);
  
//     if (error) {
//       // Log the full Joi error details for debugging
//       console.error('Joi Validation Error:', error.details);
  
//       // Send a detailed error response with the first validation error message
//       return res.status(400).json({
//         status: 'error',
//         message: error.details[0].message,  // Send only the first error message
//         details: error.details              // Optionally include all error details in the response
//       });
//     }
  
//     // Get a connection from the pool
//     const connection = await collectionofficer.promise().getConnection();
  
//     try {
//       // Step 2: Start a transaction
//       await connection.beginTransaction();
  
//       // Step 3: Insert registered farmer payment
//       const registeredFarmerId = await cropDetailsDao.insertFarmerPayment(farmerId, userId, invoiceNumber);
  
//       // Step 4: Insert crop details
//       const cropPromises = crops.map(crop => cropDetailsDao.insertCropDetails(registeredFarmerId, crop));
//       await Promise.all(cropPromises);
  
//       // Step 5: Commit the transaction
//       await connection.commit();
  
//       // Return success response
//       res.status(201).json({
//         message: 'Crop payment records added successfully',
//         registeredFarmerId
//       });
//     } catch (err) {
//       console.error('Error processing request:', err);
      
//       // Rollback the transaction if an error occurs
//       await connection.rollback();
      
//       // Return error response
//       res.status(500).json({ error: 'Internal Server Error' });
//     } finally {
//       // Release the connection back to the pool
//       connection.release();
//     }
//   };
  
// exports.addCropDetails2 = async (req, res) => {
//     console.log("Request body:", req.body.crops);
//     const { crops, farmerId,invoiceNumber } = req.body;
//     console.log('invoiceNumber:', invoiceNumber);
//     const userId = req.user.id;

//     if (!crops || typeof crops !== 'object') {
//         return res.status(400).json({ error: 'Crops data is required and must be an object' });
//     }

//     try {
//         const registeredFarmerId = await cropDetailsDao.insertFarmerPayment(farmerId, userId ,invoiceNumber);
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


exports.addCropDetails = async (req, res) => {
  console.log("Request body:", req.body);
  const { crops, farmerId, invoiceNumber } = req.body;
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

  // Get a connection from the pool
  const connection = await collectionofficer.promise().getConnection();

  try {
    // Step 2: Start a transaction
    await connection.beginTransaction();

    // Step 3: Insert registered farmer payment
    const registeredFarmerId = await cropDetailsDao.insertFarmerPayment(farmerId, userId, invoiceNumber);

    // Step 4: Process and insert crop details with S3 image uploads
    const cropPromises = crops.map(async (crop) => {
      // Process image if provided in base64 format
      let imageUrl = null;
      if (crop.image) {
        try {
          // Convert base64 to buffer
          const fileBuffer = Buffer.from(crop.image, 'base64');
          // Generate a unique filename
          const fileName = `crop_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
          // Upload to S3 and get the URL
          imageUrl = await s3middleware(fileBuffer, fileName, "crops-collection/images");
        } catch (uploadError) {
          console.error('Error uploading image to S3:', uploadError);
          throw uploadError;
        }
      }
      
      // Update the crop object with the S3 image URL
      const cropWithImageUrl = { ...crop, imageUrl };
      const officerId = userId;
      const centerId = req.user.centerId;
      return cropDetailsDao.insertCropDetails(registeredFarmerId, cropWithImageUrl,officerId ,centerId);
    });
    
    await Promise.all(cropPromises);

    // Step 5: Commit the transaction
    await connection.commit();

    // Return success response
    res.status(201).json({
      message: 'Crop payment records added successfully',
      registeredFarmerId
    });
  } catch (err) {
    console.error('Error processing request:', err);
    
    // Rollback the transaction if an error occurs
    await connection.rollback();
    
    // Return error response
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    // Release the connection back to the pool
    connection.release();
  }
};


// Simplified version
exports.addCropDetails2 = async (req, res) => {
  console.log("Request body:", req.body.crops);
  const { crops, farmerId, invoiceNumber } = req.body;
  console.log('invoiceNumber:', invoiceNumber);
  const userId = req.user.id;

  if (!crops || typeof crops !== 'object') {
    return res.status(400).json({ error: 'Crops data is required and must be an object' });
  }

  try {
    // Process image if provided
    let imageUrl = null;
    if (crops.image) {
      try {
        // Convert base64 to buffer
        const fileBuffer = Buffer.from(crops.image, 'base64');
        // Generate a unique filename
        const fileName = `crop_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
        // Upload to S3 and get the URL
        imageUrl = await uploadFileToS3(fileBuffer, fileName, "crops-collection/images");
      } catch (uploadError) {
        console.error('Error uploading image to S3:', uploadError);
        throw uploadError;
      }
    }
    
    // Update the crop object with the S3 image URL
    const cropsWithImageUrl = { ...crops, imageUrl };
    
    const registeredFarmerId = await cropDetailsDao.insertFarmerPayment(farmerId, userId, invoiceNumber);
    const officerId = userId;
    const centerId = req.user.centerId;
    await cropDetailsDao.insertCropDetails(registeredFarmerId, cropsWithImageUrl,officerId,centerId);

    res.status(201).json({
      message: 'Crop payment records added successfully',
      registeredFarmerId
    });
  } catch (err) {
    console.error('Error processing request:', err);
    
    if (err.message === "Validation error") {
      return res.status(400).json({ error: err.message });
    }
    
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

// exports.getLatestInvoiceNumber = async (req, res) => {
//     try {
//       const { empId, currentDate } = req.params;
//       console.log(empId, currentDate);
//       const latestInvoice = await cropDetailsDao.getLatestInvoiceNumberDao(empId, currentDate);
  
//       if (latestInvoice) {
//         res.status(200).json({ invoiceNumber: latestInvoice.invoiceNumber });
//       } else {
//         res.status(200).json({ invoiceNumber: null });
//       }
//     } catch (error) {
//       console.error('Error fetching latest invoice number:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   };
  
  
exports.getLatestInvoiceNumber = async (req, res) => {
  try {
    const { empId, currentDate } = req.params;

    // Fetch the latest invoice number for this employee and date
    const latestInvoice = await cropDetailsDao.getLatestInvoiceNumberDao(empId, currentDate);

    let newSequenceNumber = '00001'; // Default to 00001 if no invoice number exists

    if (latestInvoice && latestInvoice.invNo) {
      // Extract the last sequence number from the invoice (last 5 digits)
      const lastInvoiceNumber = latestInvoice.invNo;
      const lastSequence = parseInt(lastInvoiceNumber.slice(-5), 10); // Last 5 digits for sequence
      newSequenceNumber = String(lastSequence + 1).padStart(5, '0'); // Increment and pad to 5 digits
    }

    // Check if it's a new day and reset the sequence number if necessary
    const currentDateFromInvoice = latestInvoice ? latestInvoice.invNo.slice(empId.length, empId.length + 6) : null;
    
    // If the current date does not match the invoice's date, reset the sequence to '00001'
    if (currentDate !== currentDateFromInvoice) {
      newSequenceNumber = '00001';
    }

    // Generate the new invoice number
    const invoiceNumber = `${empId}${currentDate}${newSequenceNumber}`;
    console.log('Generated Invoice Number:', invoiceNumber);

    // Respond with the newly generated invoice number
    res.status(200).json({ invoiceNumber });
  } catch (error) {
    console.error('Error generating invoice number:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
