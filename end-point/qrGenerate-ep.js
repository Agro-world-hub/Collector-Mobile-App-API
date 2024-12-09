const qrGenerate = require('../dao/qrGenerate-dao');

// Function to fetch user and bank details based on QR scanned data
exports.getUserData = async (req, res) => {
  const qrData = req.body.qrData; // Get QR data from the request body

  try {
    // Query the 'users' table for user basic info using DAO
    const userRows = await qrGenerate.getUserByPhoneNumber(qrData);
    console.log(userRows); // For debugging
    if (userRows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userRows[0]; // Extract user data

    // Query the 'userbankdetails' table for bank info using DAO
    const bankDetailsRows = await qrGenerate.getBankDetailsByUserId(user.id);
    if (bankDetailsRows.length === 0) {
      return res.status(404).json({ message: 'Bank details not found' });
    }

    const bankDetails = bankDetailsRows[0]; // Extract bank details

    // Combine user and bank details
    const combinedUserData = {
      ...user,
      ...bankDetails,
    };

    // Return the combined data as a response
    res.status(200).json(combinedUserData);

  } catch (error) {
    // Catch any error and return a server error response
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
