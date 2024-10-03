const express = require('express');
const {getUserData} = require('../Controllers/QRcontroller');
const router = express.Router();

// Route for fetching user and bank details from the scanned QR code
router.post('/getUserData', getUserData);

module.exports = router;