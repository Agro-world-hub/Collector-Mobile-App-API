const db = require('../startup/database');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = 'Tl';
// Function to handle login
const login = (req, res) => {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const sql = 'SELECT * FROM collectionofficer WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const officer = results[0];

        // Create a JWT token payload (you can add more fields as needed)
        const payload = {
            id: officer.id,
            email: officer.email,
            firstName: officer.firstName,
            lastName: officer.lastName
        };

        // Generate the JWT token
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        // Check if the user needs to update the password
        if (!officer.passwordUpdated) {
            return res.status(200).json({ 
                message: 'Login successful, but password update is required',
                officer: officer,
                passwordUpdateRequired: true,
                token: token  // Include the JWT token
            });
        }

        res.status(200).json({ 
            message: 'Login successful',
            officer: officer,
            passwordUpdateRequired: false,
            token: token  // Include the JWT token
        });
    });
};

// Function to update the password
const updatePassword = (req, res) => {
    const { email, currentPassword, newPassword } = req.body;

    // Validate inputs
    if (!email || !currentPassword || !newPassword) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if the current password is correct
    const checkPasswordSql = 'SELECT * FROM collectionofficer WHERE email = ? AND password = ?';
    db.query(checkPasswordSql, [email, currentPassword], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Update the password and set passwordUpdated to true
        const updatePasswordSql = `
            UPDATE collectionofficer
            SET password = ?, passwordUpdated = TRUE
            WHERE email = ?
        `;
        db.query(updatePasswordSql, [newPassword, email], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Database error while updating password' });
            }
            res.status(200).json({ message: 'Password updated successfully' });
        });
    });
};

//get profice section
const getProfile = (req, res) => {
    const userId = req.user.id;

    const sql = 'SELECT firstName, lastName, phoneNumber01, phoneNumber02, nic, email FROM collectionofficer WHERE id=?';
    db.query(sql, [userId],(err,results)=>{
        if(err){
            return res.status(500).jason({
                status:'error',
                message:'Database error:' + err,
         
            });

        }
        console.log(results);
        if (results.length == 0){
            return res.status(404).json({
                status:'error',
                message:'User not found',
            });
        }

        const user = results[0];
        return res.status(200).json({
            status:'suuccess',
            user:user,
        });
    });
};

module.exports = {
    login,
    updatePassword,
    getProfile
};
