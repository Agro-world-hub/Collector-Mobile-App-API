const jwt = require("jsonwebtoken");
const searchFarmerDao = require('../dao/searchFarmer-dao');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await searchFarmerDao.getAllUsers(); // Fetch users from the DAO
        res.status(200).json(users); // Return the list of users
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'An error occurred while fetching users' });
    }
};