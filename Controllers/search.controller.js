const db = require('../startup/database'); // Import the database connection
const asyncHandler = require("express-async-handler");




// Get all users from the users table
const getAllUsers = asyncHandler(async(req, res) => {
    try {
        const sql = 'SELECT id, firstName, lastName, phoneNumber, NICnumber, created_at FROM users ';

        // Execute the SQL query
        db.query(sql, (err, results) => {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).send('An error occurred while fetching data.');
                return;
            }

            // Return the list of users
            res.status(200).json(results);
        });

    } catch (err) {
        console.error("Error in getAllUsers:", err);
        res.status(500).json({ message: "Internal Server Error!" });
    }
});

module.exports = {
    getAllUsers
};