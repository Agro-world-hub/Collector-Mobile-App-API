const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const db = require('../startup/database'); // Ensure that this uses mysql2/promise
const asyncHandler = require('express-async-handler');

// Controller to handle both user details, payment details, and QR code generation
const addUserAndPaymentDetails = asyncHandler(async (req, res) => {
  const { 
    firstName, 
    lastName, 
    NICnumber, 
    phoneNumber, 
    address, 
    accNumber, 
    accHolderName, 
    bankName, 
    branchName 
  } = req.body;

  // Validation: Check if all fields are filled
  if (!firstName || !lastName || !NICnumber || !phoneNumber || !address || !accNumber || !accHolderName || !bankName || !branchName) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const connection = await db.promise();

  try {
    // Start a transaction
    await connection.beginTransaction();

    // Insert into the 'users' table
    const userSql = `
      INSERT INTO users (firstName, lastName, NICnumber, phoneNumber)
      VALUES (?, ?, ?, ?)
    `;
    const [userResult] = await connection.query(userSql, [firstName, lastName, NICnumber, phoneNumber]);

    const userId = userResult.insertId;

    // Insert into the 'userbankdetails' table
    const paymentSql = `
      INSERT INTO userbankdetails (userId, address, accNumber, accHolderName, bankName, branchName)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [paymentResult] = await connection.query(paymentSql, [userId, address, accNumber, accHolderName, bankName, branchName]);

    const paymentId = paymentResult.insertId;

    // Step 1: Generate QR Code data with user and bank details
    const qrData = `
      User Info:
      Name: ${firstName} ${lastName}
      NIC: ${NICnumber}
      Phone: ${phoneNumber}

      Bank Info:
      Account Holder: ${accHolderName}
      Account Number: ${accNumber}
      Bank: ${bankName}
      Branch: ${branchName}
    `;

    // Define the directory path for QR codes
    const qrDirPath = path.join(__dirname, `../public/qrcodes`);
    
    // Step 2: Ensure the directory exists
    if (!fs.existsSync(qrDirPath)) {
      fs.mkdirSync(qrDirPath, { recursive: true }); // Create directory if it doesn't exist
    }

    // Generate QR Code as PNG and save it
    const qrFilePath = path.join(qrDirPath, `user_${userId}.png`);
    await QRCode.toFile(qrFilePath, qrData, { type: 'png' });

    // Step 3: Update the 'users' table with the QR code file path
    const updateQrSql = `
      UPDATE users SET farmerQr = ? WHERE id = ?
    `;
    await connection.query(updateQrSql, [qrFilePath, userId]);

    // Step 4: Commit the transaction
    await connection.commit();

    // Success response
    res.status(201).json({ 
      message: "User, bank details, and QR code added successfully", 
      userId: userId, 
      paymentId: paymentId, 
      qrCodePath: qrFilePath 
    });
    
  } catch (error) {
    // Rollback the transaction in case of any error
    await connection.rollback();
    res.status(500).json({ error: "Transaction failed: " + error.message });
  } finally {
    await connection.end();
  }
});



const getRegisteredFarmerDetails = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const connection = await db.promise();

  try {
    const userSql = `
      SELECT firstName, lastName, NICnumber, farmerQr 
      FROM users 
      WHERE id = ?
    `;
    const [rows] = await connection.query(userSql, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = rows[0];

    // Convert BLOB to Base64
    let qrCodeBase64 = '';
    if (user.farmerQr) {
      qrCodeBase64 = `data:image/png;base64,${user.farmerQr.toString('base64')}`;
    }

    const response = {
      firstName: user.firstName,
      lastName: user.lastName,
      NICnumber: user.NICnumber,
      qrCode: qrCodeBase64, // Base64 string
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch farmer details: " + error.message });
  } finally {
    await connection.end();
  }
});


module.exports = { addUserAndPaymentDetails, getRegisteredFarmerDetails };
