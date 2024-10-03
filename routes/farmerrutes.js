const express = require('express');
const { addUserAndPaymentDetails } = require('../Controllers/farmer.controllers'); // Path to your controller
const auth = require('../Middlewares/auth.middleware');
const router = express.Router();

router.post('/register-farmer', addUserAndPaymentDetails);

module.exports = router;
