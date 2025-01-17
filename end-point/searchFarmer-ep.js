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

exports.getUsers = async (req, res) => {
    const nic = req.params.NICnumber;
    console.log('Fetching user with NIC number:', nic);

    try {
        // Fetch user details from the DAO
        const users = await searchFarmerDao.getUsers(nic);

        // Check if any user was found
        if (users.length === 0) {
            return res.status(404).json({ error: 'No existing user found with the provided NIC number' });
        }

        // If users are found, return the data
        res.status(200).json(users[0]);
        console.log('Fetched users:', users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'An error occurred while fetching users' });
    }
};


