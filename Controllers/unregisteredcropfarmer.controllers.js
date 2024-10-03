const jwt = require('jsonwebtoken');
const db = require('../startup/database');

const addCropDetails = (req, res) => {
  // Check if user is authenticated and get the collection officer ID
  const collectionOfficerId = req.user?.id;

  if (!collectionOfficerId) {
    return res.status(401).json({
      status: 'error',
      message: 'Collection officer ID is missing in the token',
    });
  }

  // Destructure the required fields from the request body
  const { userId, cropName, quality, unitPrice, quantity, total } = req.body;

  // Validate the incoming data
  if (!userId || !cropName || !quality || !unitPrice || !quantity || !total) {
    return res.status(400).json({
      status: 'error',
      message: 'All fields are required',
    });
  }

  // SQL query to insert crop details into the database
  const sql = `
    INSERT INTO registeredfarmerpayments (userId, collectionOfficerId, cropName, quality, unitPrice, quantity, total)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  // Execute the SQL query
  db.query(sql, [userId, collectionOfficerId, cropName, quality, unitPrice, quantity, total], (err, result) => {
    if (err) {
      console.error('Database error:', err); // Log the database error for debugging
      return res.status(500).json({
        status: 'error',
        message: 'An error occurred while adding crop details',
      });
    }

    // Successfully added crop details
    res.status(201).json({
      status: 'success',
      message: 'Crop details added successfully',
      data: {
        id: result.insertId, // Return the ID of the newly created record
        userId,
        collectionOfficerId,
        cropName,
        quality,
        unitPrice,
        quantity,
        total,
      },
    });
  });
};

module.exports = {
  addCropDetails,
};
