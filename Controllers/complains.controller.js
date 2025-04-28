const db = require('../startup/database'); // Adjust the path to your database connection
const { v4: uuidv4 } = require('uuid'); // To generate unique IDs


const createFarmerComplaint = async (req, res) => {
    try {
        const { farmerName, farmerPhone, complain, language } = req.body;

        // Validate required fields
        if (!farmerName || !farmerPhone || !complain || !language) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Extract officer details from the request user
        const { firstNameEnglish, lastNameEnglish, phoneNumber01 } = req.user;

        // Construct officerName and officerPhone from payload
        const officerName = `${firstNameEnglish} ${lastNameEnglish}`;
        const officerPhone = phoneNumber01;

        // Generate a unique reference number based on a pattern
        const refNo = `COMP-${uuidv4().slice(0, 8)}`; // Example pattern: COMP-xxxxxx

        // Default status
        const status = 'Not answered';

        // Insert the complaint into the database with .promise() to return a promise
        const sql = `
            INSERT INTO farmerComplains (refNo, status, officerName, farmerName, officerPhone, farmerPhone, complain, language)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [refNo, status, officerName, farmerName, officerPhone, farmerPhone, complain, language];

        await db.promise().query(sql, values); // Add .promise() here

        return res.status(201).json({ message: 'Complaint registered successfully', refNo });
    } catch (error) {
        console.error('Error inserting complaint:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};


module.exports = {
    createFarmerComplaint,
};