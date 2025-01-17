const express = require('express');
const { addUserAndPaymentDetails, getRegisteredFarmerDetails, getUserWithBankDetails } = require('../Controllers/farmer.controllers'); // Path to your controller
const auth = require('../Middlewares/auth.middleware');
const router = express.Router();

const farmerEp = require('../end-point/farmer-ep');

router.post('/register-farmer', farmerEp.addUserAndPaymentDetails);
router.get('/register-farmer/:userId',farmerEp.getRegisteredFarmerDetails);

router.get('/report-user-details/:id', farmerEp.getUserWithBankDetails);
router.post('/farmer-register-checker', farmerEp.signupChecker);


module.exports = router;