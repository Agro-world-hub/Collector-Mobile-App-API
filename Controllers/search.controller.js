const db = require('../startup/database'); // Import the database connection

// Search for user by NICnumber
exports.searchUserByNIC = (req, res) => {
  const { nic } = req.query; // Get NIC number from query parameters
  console.log(nic);

  if (!nic) {
    return res.status(400).json({ message: 'NIC number is required' });
  }

  // Query to search for NICnumber and return only firstName and NICnumber
  db.query('SELECT firstName, NICnumber FROM users WHERE NICnumber = ?', [nic])
    .then(([rows]) => {
      if (rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Return the NICnumber and firstName of the user found
      res.status(200).json({ nic: rows[0].NICnumber, name: rows[0].firstName });
    })
    .catch((error) => {
      console.error('Error searching for user by NIC:', error);
      res.status(500).json({ message: 'Server error' });
    });
};
