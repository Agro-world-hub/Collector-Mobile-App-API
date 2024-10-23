const express = require('express');
const { addUserAndPaymentDetails,getRegisteredFarmerDetails } = require('../Controllers/farmer.controllers'); // Path to your controller
const auth = require('../Middlewares/auth.middleware');
const router = express.Router();

router.post('/register-farmer', addUserAndPaymentDetails);
router.get('/register-farmer/:userId', getRegisteredFarmerDetails);

module.exports = router;
