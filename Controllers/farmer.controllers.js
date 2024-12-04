const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const db = require('../startup/database'); // Ensure this imports your single connection
const asyncHandler = require('express-async-handler');

// Controller to handle user and payment details and QR code generation
const addUserAndPaymentDetails = asyncHandler(async(req, res) => {
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

    try {
        // Start a transaction
        await new Promise((resolve, reject) => {
            db.beginTransaction(err => {
                if (err) return reject(err);
                resolve();
            });
        });

        // Insert into the 'users' table
        const userSql = `
            INSERT INTO users (firstName, lastName, NICnumber, phoneNumber)
            VALUES (?, ?, ?, ?)
        `;
        const userResult = await new Promise((resolve, reject) => {
            db.query(userSql, [firstName, lastName, NICnumber, phoneNumber], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        const userId = userResult.insertId;

        // Insert into the 'userbankdetails' table
        const paymentSql = `
            INSERT INTO userbankdetails (userId, address, accNumber, accHolderName, bankName, branchName)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const paymentResult = await new Promise((resolve, reject) => {
            db.query(paymentSql, [userId, address, accNumber, accHolderName, bankName, branchName], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        const paymentId = paymentResult.insertId;

        // Define the JSON structure for QR code data
        const qrData = {
            userInfo: {
                id: userId,
                name: `${firstName} ${lastName}`,
                NIC: NICnumber,
                phone: phoneNumber
            },
            bankInfo: {
                accountHolder: accHolderName,
                accountNumber: accNumber,
                bank: bankName,
                branch: branchName
            }
        };

        // Define the directory path for QR codes
        const qrDirPath = path.join(__dirname, `../public/qrcodes`);

        // Ensure the directory exists
        if (!fs.existsSync(qrDirPath)) {
            fs.mkdirSync(qrDirPath, { recursive: true }); // Create directory if it doesn't exist
        }

        // Generate QR Code as PNG and save it
        const qrFilePath = path.join(qrDirPath, `user_${userId}.png`);
        await QRCode.toFile(qrFilePath, JSON.stringify(qrData), { type: 'png' }); // Convert JSON to string

        // Update the 'users' table with the QR code file path
        const updateQrSql = `
            UPDATE users SET farmerQr = ? WHERE id = ?
        `;
        await new Promise((resolve, reject) => {
            db.query(updateQrSql, [qrFilePath, userId], (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        // Commit the transaction
        await new Promise((resolve, reject) => {
            db.commit(err => {
                if (err) return reject(err);
                resolve();
            });
        });

        // Success response
        res.status(201).json({
            message: "User, bank details, and QR code added successfully",
            userId: userId,
            paymentId: paymentId,
            qrCodePath: qrFilePath
        });

    } catch (error) {
        // Rollback the transaction in case of any error
        try {
            await new Promise((resolve) => {
                db.rollback(() => {
                    resolve();
                });
            });
        } catch (rollbackError) {
            console.error("Rollback failed:", rollbackError);
        }
        res.status(500).json({ error: "Transaction failed: " + error.message });
    }
});


// Controller to fetch registered farmer details
const getRegisteredFarmerDetails = asyncHandler(async(req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    try {
        const userSql = `
            SELECT firstName, lastName, NICnumber, farmerQr , phoneNumber
            FROM users 
            WHERE id = ?
        `;
        const rows = await new Promise((resolve, reject) => {
            db.query(userSql, [userId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        if (rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = rows[0];

        // Convert QR code file path to Base64 if it exists
        let qrCodeBase64 = '';
        if (user.farmerQr) {
            const qrCodeData = fs.readFileSync(user.farmerQr); // Read the QR code file
            qrCodeBase64 = `data:image/png;base64,${qrCodeData.toString('base64')}`; // Convert to Base64
        }

        const response = {
            firstName: user.firstName,
            lastName: user.lastName,
            NICnumber: user.NICnumber,
            qrCode: qrCodeBase64,
            phoneNumber: user.phoneNumber // Base64 string
        };

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch farmer details: " + error.message });
    }
});


// Controller to get report user and bank details with QR code in Base64
const getUserWithBankDetails = asyncHandler(async(req, res) => {
    const userId = req.params.id;

    // Query to get user details along with bank details
    const query = `
        SELECT 
            u.id AS userId,
            u.firstName,
            u.lastName,
            u.phoneNumber,
            u.NICnumber,
            u.profileImage,
            u.farmerQr,
            b.address,
            b.accNumber,
            b.accHolderName,
            b.bankName,
            b.branchName,
            b.createdAt
        FROM users u
        LEFT JOIN userbankdetails b ON u.id = b.userId
        WHERE u.id = ?;
    `;

    try {
        const [rows] = await db.promise().query(query, [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = rows[0];

        // Convert QR code file path to Base64 if it exists
        let qrCodeBase64 = '';
        if (user.farmerQr) {
            const qrCodeData = fs.readFileSync(user.farmerQr); // Read the QR code file
            qrCodeBase64 = `data:image/png;base64,${qrCodeData.toString('base64')}`; // Convert to Base64
        }

        // Add the Base64 QR code to the user data
        const response = {
            userId: user.userId,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            NICnumber: user.NICnumber,
            profileImage: user.profileImage,
            qrCode: qrCodeBase64,
            address: user.address,
            accNumber: user.accNumber,
            accHolderName: user.accHolderName,
            bankName: user.bankName,
            branchName: user.branchName,
            createdAt: user.createdAt
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user with bank details: " + error.message });
    }
});

module.exports = { addUserAndPaymentDetails, getRegisteredFarmerDetails, getUserWithBankDetails };