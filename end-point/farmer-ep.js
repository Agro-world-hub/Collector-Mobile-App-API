const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const farmerDao = require('../dao/farmar-dao');
const asyncHandler = require('express-async-handler');

// Controller to handle user and payment details and QR code generation
exports.addUserAndPaymentDetails = asyncHandler(async (req, res) => {
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
        const userResult = await farmerDao.createUser(firstName, lastName, NICnumber, phoneNumber);
        const userId = userResult.insertId;

        // Insert into the 'userbankdetails' table
        const paymentResult = await farmerDao.createPaymentDetails(userId, address, accNumber, accHolderName, bankName, branchName);
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
        await QRCode.toFile(qrFilePath, JSON.stringify(qrData), { type: 'png' });

        // Update the 'users' table with the QR code file path
        await farmerDao.updateQrCodePath(userId, qrFilePath);

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



exports.getRegisteredFarmerDetails = async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    try {
        // Fetch the raw farmer data from the DAO layer
        const rows = await farmerDao.getFarmerDetailsById(userId);
        console.log('rows', rows);
        // If no user found, return a 404 response
        if (rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = rows[0];
        console.log('user', user);

        // Convert QR code file path to Base64 if it exists
        let qrCodeBase64 = '';
        if (user.farmerQr) {
            const qrCodePath = user.farmerQr.toString();
            console.log('QR Code Path:', qrCodePath);
        
            try {
                if (fs.existsSync(qrCodePath)) {
                    const qrCodeData = fs.readFileSync(qrCodePath);
                    qrCodeBase64 = `data:image/png;base64,${qrCodeData.toString('base64')}`;
                    console.log('QR Code Base64:', qrCodeBase64);
                } else {
                    console.warn('QR code file not found at:', qrCodePath);
                }
            } catch (err) {
                console.error('Error processing QR code file:', err.message);
            }
        }
        


        // Prepare the response data
        const response = {
            firstName: user.firstName,
            lastName: user.lastName,
            NICnumber: user.NICnumber,
            qrCode: qrCodeBase64,
            phoneNumber: user.phoneNumber
        };
        console.log(response);

        // Send the response
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch farmer details: " + error.message });
    }
};

exports.getUserWithBankDetails = async (req, res) => {
    const userId = req.params.id;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    try {
        // Fetch the raw user data with bank details from the DAO layer
        const rows = await farmerDao.getUserWithBankDetailsById(userId);

        // If no user found, return a 404 response
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = rows[0];

        // Convert QR code file path to Base64 if it exists
        let qrCodeBase64 = '';
        if (user.farmerQr) {
            const qrCodePath = user.farmerQr.toString();
            console.log('QR Code Path:', qrCodePath);
        
            try {
                if (fs.existsSync(qrCodePath)) {
                    const qrCodeData = fs.readFileSync(qrCodePath);
                    qrCodeBase64 = `data:image/png;base64,${qrCodeData.toString('base64')}`;
                    console.log('QR Code Base64:', qrCodeBase64);
                } else {
                    console.warn('QR code file not found at:', qrCodePath);
                }
            } catch (err) {
                console.error('Error processing QR code file:', err.message);
            }
        }
        

        // Prepare the response data
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

        // Send the response
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user with bank details: " + error.message });
    }
};