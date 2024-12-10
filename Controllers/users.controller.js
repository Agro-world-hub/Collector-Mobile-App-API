const db = require('../startup/database');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = 'Tl';
// Function to handle login




//get profice section
const getProfile = (req, res) => {
    const userId = req.user.id;

    // SQL query to select the new fields from the collectionofficer table
    const sql = `
      SELECT 
        firstNameEnglish, firstNameSinhala, firstNameTamil,
        lastNameEnglish, lastNameSinhala, lastNameTamil,
        phoneNumber01, phoneNumber02, image, nic, email, 
        houseNumber, streetName, city, district, province, 
        country, languages
      FROM collectionofficer
      WHERE id = ?
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({
                status: 'error',
                message: 'Database error: ' + err,
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
            });
        }

        const user = results[0];
        return res.status(200).json({
            status: 'success',
            user: {
                firstNameEnglish: user.firstNameEnglish,
                firstNameSinhala: user.firstNameSinhala,
                firstNameTamil: user.firstNameTamil,
                lastNameEnglish: user.lastNameEnglish,
                lastNameSinhala: user.lastNameSinhala,
                lastNameTamil: user.lastNameTamil,
                phoneNumber01: user.phoneNumber01,
                phoneNumber02: user.phoneNumber02,
                image: user.image,
                nic: user.nic,
                email: user.email,
                address: {
                    houseNumber: user.houseNumber,
                    streetName: user.streetName,
                    city: user.city,
                    district: user.district,
                    province: user.province,
                    country: user.country,
                },
                languages: user.languages,
            },
        });
    });
};

const getUserDetails = async(req, res) => {
    try {
        const userId = req.user.id;

        const sql = `
        SELECT 
          co.firstNameEnglish AS firstName,
          co.lastNameEnglish AS lastName,
          co.phoneNumber01 AS phoneNumber,
          co.nic AS nicNumber,
          CONCAT(co.houseNumber, ', ', co.streetName, ', ', co.city) AS address,
          cod.companyNameEnglish AS companyName,
          cod.jobRole AS jobRole,
          cod.assignedDistrict AS regcode
        FROM collectionofficer AS co
        LEFT JOIN collectionofficercompanydetails AS cod ON cod.collectionOfficerId = co.id
        WHERE co.id = ?
      `;

        db.query(sql, [userId], (err, result) => {
            if (err) {
                console.error('Error fetching user details:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            const user = result[0];
            res.status(200).json({
                firstName: user.firstName,
                lastName: user.lastName,
                companyName: user.companyName,
                regcode: user.regcode,
                jobRole: user.jobRole,
                nicNumber: user.nicNumber,
                address: user.address,
                phoneNumber: user.phoneNumber,
            });
        });
    } catch (error) {
        console.error('Error in getUserDetails controller:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Update phone number controller
const updatePhoneNumber = async(req, res) => {
    const userId = req.user.id; // Assuming req.user is set by your authentication middleware
    const { phoneNumber } = req.body;
    console.log(phoneNumber);

    // Input validation
    if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.length !== 11) {
        return res.status(400).json({ message: 'Invalid phone number. It must be 11 characters long.' });
    }

    // Add the + prefix to the phone number
    const formattedPhoneNumber = `+${phoneNumber}`;

    // SQL query to update the phone number
    const query = 'UPDATE collectionofficer SET phoneNumber01 = ? WHERE id = ?';

    try {
        db.query(query, [formattedPhoneNumber, userId], (error, results) => {
            if (error) {
                console.error('Error updating phone number:', error);
                return res.status(500).json({ message: 'Failed to update phone number' });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            return res.status(200).json({ message: 'Phone number updated successfully' });
        });
    } catch (error) {
        console.error('Database query error:', error);
        return res.status(500).json({ message: 'An error occurred while updating the phone number' });
    }
};

const getOfficerQRCode = (req, res) => {
    const officerId = req.user.id; // Extract officer ID from the authenticated user

    const query = `
        SELECT QRcode 
        FROM collectionofficer
        WHERE id = ?
    `;

    db.query(query, [officerId], (error, results) => {
        if (error) {
            console.error('Error fetching officer QR code:', error);
            return res.status(500).json({ error: 'Database query failed' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Officer not found' });
        }

        const { QRcode } = results[0];
        if (!QRcode) {
            return res.status(404).json({ error: 'QR code not available for this officer' });
        }

        // Convert QRcode binary data to base64
        const qrCodeBase64 = QRcode.toString('base64');

        res.status(200).json({
            message: 'Officer QR code retrieved successfully',
            QRcode: `data:image/png;base64,${qrCodeBase64}` // Return as a base64-encoded image
        });
    });
};



module.exports = {
    getOfficerQRCode
};