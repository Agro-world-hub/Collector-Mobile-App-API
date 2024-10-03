const db = require('../startup/database');

// Function to fetch user and bank details based on QR scanned data
exports.getUserData = async (req, res) => {
  const qrData = req.body.qrData;
  const query = (sql, params) => {
    return new Promise((resolve, reject) => {
      db.query(sql, params, (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  };
  try {
    // Query the 'users' table for user basic info
    const userRows = await query(
      'SELECT id, firstName, lastName, phoneNumber, NICnumber FROM users WHERE phoneNumber = ?',
      [qrData]
    );
    console.log(userRows)
    if (!userRows) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userRows[0];

    // Query the 'userbankdetails' table for additional bank info
    const bankDetailsRows = await query(
      'SELECT address, accNumber, accHolderName, bankName, branchName FROM userbankdetails WHERE userId = ?',
      [user.id]
    );

    if (!bankDetailsRows) {
      return res.status(404).json({ message: 'Bank details not found' });
    }

    const bankDetails = bankDetailsRows[0];

    // Combine user data and bank details
    const combinedUserData = {
      ...user,
      ...bankDetails,
    };

    // Return the combined data
    res.status(200).json(combinedUserData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

